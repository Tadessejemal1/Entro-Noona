import StepTemplate from "~/components/StepTemplate";
import * as database from "~/shared/database";
import * as api from "~/shared/api";
import { useNavigate } from "@remix-run/react";
import { storage } from "~/utils/session-helpers";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const action = url.searchParams.get("action");
  const id_token = url.searchParams.get("id_token");

  if (id_token) {
    if (action === "uninstall") {
      console.log("Uninstall action detected. Cleanup logic should be implemented here.");
      return redirect("/"); // Redirect to home after uninstall
    } else {
      return redirect(`/home?id_token=${id_token}&action=${action}`);
    }
  }

  if (!code) {
    return redirect("/"); // Redirect to login if no code is provided
  }

  try {
    const token = await api.codeTokenExchange(code);
    const accessToken = token.access_token;

    const user = await api.getUserFromToken(accessToken);
    if (!user || !user.companies || user.companies.length === 0) {
      throw new Error("No companies associated with the user.");
    }

    const companyId = user.companies[0];
    const session = await storage.getSession(request.headers.get("Cookie"));
    session.set("userId", user.id);
    session.set("companyId", companyId);
    session.set("noonaAccessToken", accessToken);
    const cookieHeader = await storage.commitSession(session);

    await database.storeOAuthToken(companyId, token);

    const existingWebhooks = await api.getExistingWebhooks(companyId, accessToken);
    const requiredWebhooks = ["event.created", "event.updated", "event.deleted"];

    await Promise.all(
      requiredWebhooks.map(async (eventType) => {
        const callbackUrlEnvKey = `${eventType.toUpperCase().replace(".", "_")}_CALLBACK_URL`;
        const callbackPath = process.env[callbackUrlEnvKey];

        if (!callbackPath) {
          throw new Error(`Environment variable ${callbackUrlEnvKey} is not defined.`);
        }

        const callbackUrl = `${process.env.APP_BASE_URL}/${callbackPath}`;
        const webhookExists = existingWebhooks.some((wh) => wh.events.includes(eventType));

        if (!webhookExists) {
          await api.createWebhook(accessToken, companyId, eventType);
          console.log(`Webhook created for ${eventType} with callback URL: ${callbackUrl}`);
        } else {
          console.log(`Webhook for ${eventType} already exists.`);
        }
      })
    );

    return json({}, { headers: { "Set-Cookie": cookieHeader } });
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    return redirect(`/error?message=oauth_callback_failed`);
  }
};

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <StepTemplate
      question="Entronoona Plugin installed"
      onContinue={() => navigate("/workflows")}
      buttonText="Installed"
    >
      <div className="p-4">
        The Entronoona Plugin is successfully installed and ready to use. You can now start creating workflows,
        sending out custom emails, and more.
      </div>
    </StepTemplate>
  );
};

export default Onboarding;
