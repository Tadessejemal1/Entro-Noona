import React, { useMemo, useState, useCallback } from 'react';
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { ArrowLeft, Trash } from "lucide-react";
import { json } from "@remix-run/node";
import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import * as database from '~/shared/database';
import { protectEndpoint } from "~/utils/protect-endpoint";
import { getCompanyIdFromCookie } from "~/utils/session-helpers";

// Loader function to fetch logs
export const loader = async ({ request }) => {
  await protectEndpoint(request);
  const companyId = await getCompanyIdFromCookie(request);
  const logs = await database.getActionLogsByCompanyId(companyId);
  return json({ logs });
};

// Action function to handle deletion
export const action = async ({ request }) => {
  const formData = await request.formData();
  const logId = formData.get("logId");
  console.log('Received logId for deletion:', logId); // Debugging line
  if (logId) {
    try {
      const result = await database.deleteLogById(logId);
      console.log('Deletion result:', result); // Debugging line
      return json({ success: true });
    } catch (error) {
      console.error('Deletion error:', error); // Debugging line
      return json({ success: false, error: error.message });
    }
  }
  return json({ success: false, error: "No log ID provided" });
};

// Main Log component
const Log = () => {
  const { logs } = useLoaderData();
  const submit = useSubmit();
  const [filter, setFilter] = useState("");

  const handleDelete = useCallback(async (logId) => {
    console.log('Attempting to delete log with ID:', logId); // Debugging line
    if (confirm("Are you sure you want to delete this log entry?")) {
      const formData = new FormData();
      formData.append("logId", logId);
      try {
        await submit(formData, { method: "post" });
        toast.success("Log entry deleted successfully!");
      } catch (error) {
        console.error('Error during deletion:', error); // Debugging line
        toast.error("Failed to delete log entry.");
      }
    }
  }, [submit]);

  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Action Type', accessor: 'action_type' },
    { Header: 'Status', accessor: 'status' },
    {
      Header: 'Details',
      accessor: 'details',
      width: 75,
      Cell: ({ value }) => {
        let details;
        try {
          details = typeof value === "string" ? JSON.parse(value) : value;
        } catch (error) {
          console.error("Failed to parse JSON:", value);
          return <div>Error parsing details</div>;
        }
        return <pre>{JSON.stringify(details, null, 2)}</pre>;
      }
    },
    { Header: 'Logged At', accessor: 'created_at', Cell: ({ value }) => new Date(value).toLocaleString() },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <button
          onClick={() => handleDelete(row.original.id)}
          className="flex items-center justify-center text-white bg-red-500 rounded-full p-2 hover:bg-red-600 hover:shadow-lg transition-transform transform hover:-translate-y-1"
        >
          <Trash className="w-5 h-5" />
        </button>
      )
    }
  ], [handleDelete]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    prepareRow,
    setGlobalFilter,
    state,
    pageCount,
    gotoPage,
    setPageSize,
  } = useTable(
    {
      columns,
      data: logs,
      initialState: { pageIndex: 0, pageSize: 5 } // Set initial page index and page size
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const handleFilterChange = useCallback((e) => {
    const value = e.target.value || undefined;
    setGlobalFilter(value);
    setFilter(value);
  }, [setGlobalFilter]);

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className="flex items-center gap-2 mb-4">
        <Link to="/workflows">
          <button className="flex text-white bg-blue-500 rounded-full p-2 hover:bg-blue-600 text-sm items-center gap-1 justify-center">
            <ArrowLeft />
          </button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Log Detail</h1>
      </div>
      <div className="relative mb-4">
        <input
          type="text"
          value={filter}
          onChange={handleFilterChange}
          placeholder="Search logs"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div className="overflow-auto">
        <table {...getTableProps()} className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-100">
            {headerGroups.map(headerGroup => (
              headerGroup.headers.map(column => {
                const { key, ...rest } = column.getHeaderProps(column.getSortByToggleProps());
                return (
                  <th key={key} {...rest} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {column.render('Header')}
                    <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                  </th>
                );
              })
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              const { key, ...rowProps } = row.getRowProps();
              const rowClass = row.original.status === 'failure' ? 'text-red-500' : 'text-gray-900';
              return (
                <tr key={key} {...rowProps} className={`hover:bg-gray-100 ${rowClass}`}>
                  {row.cells.map(cell => (
                    <td key={cell.column.id} {...cell.getCellProps()} className="px-6 py-4 whitespace-normal break-words text-sm">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="py-3 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="btn btn-primary">
            Previous
          </button>
          <button onClick={() => nextPage()} disabled={!canNextPage} className="btn btn-primary">
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{state.pageIndex * state.pageSize + 1}</span> to <span className="font-medium">{state.pageIndex * state.pageSize + page.length}</span> of <span className="font-medium">{logs.length}</span> results
            </p>
          </div>
          <div>
            <button onClick={() => previousPage()} disabled={!canPreviousPage} className="btn btn-primary mx-1">
              Previous
            </button>
            <button onClick={() => nextPage()} disabled={!canNextPage} className="btn btn-primary mx-1">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Log;
