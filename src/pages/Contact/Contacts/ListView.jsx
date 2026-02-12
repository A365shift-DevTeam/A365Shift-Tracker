import { useState, useEffect, useRef } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Edit, Trash2, Eye, ArrowUp, ArrowDown, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, MoreHorizontal, Building, User } from 'lucide-react'

export const ListView = ({ contacts, sortBy, sortOrder, onSort, onEdit, onDelete, onPreview }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const tableRef = useRef(null)

  const columns = [
    { id: 'name', name: 'Name' },
    { id: 'jobTitle', name: 'Job Title' },
    { id: 'phone', name: 'Phone' },
    { id: 'company', name: 'Company' },
    { id: 'location', name: 'Location' },
    { id: 'type', name: 'Entity Type' },
    { id: 'status', name: 'Status' }
  ]

  const handleSort = (columnId) => {
    onSort(columnId)
  }

  const getSortIcon = (columnId) => {
    if (sortBy !== columnId) return null
    return sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
  }

  // Pagination calculations
  const totalContacts = contacts.length
  const totalPages = Math.ceil(totalContacts / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, totalContacts)
  const paginatedContacts = contacts.slice(startIndex, endIndex)

  // Reset to first page when contacts change or rows per page changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1)
  }, [contacts.length, rowsPerPage])

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value))
    setCurrentPage(1)
  }

  const goToFirstPage = () => setCurrentPage(1)
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1))
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1))
  const goToLastPage = () => setCurrentPage(totalPages)

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active': return 'badge-enterprise badge-green'
      case 'Lead': return 'badge-enterprise badge-blue'
      case 'Customer': return 'badge-enterprise badge-teal'
      case 'Inactive': return 'badge-enterprise badge-gray'
      default: return 'badge-enterprise badge-gray'
    }
  }

  const getTypeBadgeClass = (type) => {
    return type === 'Company' ? 'badge-enterprise badge-blue' : 'badge-enterprise badge-gray'
  }

  return (
    <div className="contacts-list-view-container">
      <div className="contacts-table-container">
        <div className="table-responsive">
          <table ref={tableRef} className="table contacts-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleSort(column.id)}
                    className="sortable-header"
                  >
                    <div className="d-flex align-items-center gap-2">
                      {column.name}
                      {getSortIcon(column.id)}
                    </div>
                  </th>
                ))}
                <th style={{ width: '100px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center text-muted py-5">
                    No contacts found. Create a new contact to get started.
                  </td>
                </tr>
              ) : (
                paginatedContacts.map(contact => (
                  <tr key={contact.id} className="contacts-table-row">
                    {/* Name Column */}
                    <td>
                      <div className="contact-cell-primary">
                        <span className="contact-name">{contact.name || '-'}</span>
                        <span className="contact-subtext">
                          <Building size={12} /> {contact.company || 'No Company'}
                        </span>
                      </div>
                    </td>

                    {/* Job Title Column */}
                    <td>
                      <div className="contact-cell-primary">
                        <span className="fw-medium text-dark">{contact.jobTitle || 'Unknown Role'}</span>
                        <span className="contact-subtext">{contact.department || contact.company}</span>
                      </div>
                    </td>

                    {/* Phone Column */}
                    <td className="fw-medium text-secondary">
                      {contact.phone || '-'}
                    </td>

                    {/* Company Column */}
                    <td>
                      <div className="contact-cell-primary">
                        <span className="fw-medium text-dark">{contact.company || '-'}</span>
                        <span className="contact-subtext">{contact.company}</span>
                      </div>
                    </td>

                    {/* Location Column */}
                    <td className="text-secondary">
                      {contact.location || 'San Francisco, CA'}
                    </td>

                    {/* Entity Type Column */}
                    <td>
                      <span className={getTypeBadgeClass('Company')}>
                        Company
                      </span>
                    </td>

                    {/* Status Column */}
                    <td>
                      <span className={getStatusBadgeClass(contact.status)}>
                        {contact.status || '-'}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="text-center">
                      <div className="d-flex gap-3 justify-content-center">
                        <div className="action-icon-wrapper text-primary" onClick={() => onPreview(contact)} style={{ cursor: 'pointer' }}>
                          <Eye size={18} />
                        </div>
                        <div className="action-icon-wrapper text-info" onClick={() => onEdit(contact)} style={{ cursor: 'pointer' }}>
                          <Edit size={18} />
                        </div>
                        <div className="action-icon-wrapper text-danger" onClick={() => {
                          if (window.confirm('Are you sure you want to delete this contact?')) {
                            onDelete(contact.id)
                          }
                        }} style={{ cursor: 'pointer' }}>
                          <Trash2 size={18} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalContacts > 0 && (
          <div className="contacts-pagination d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Form.Select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                size="sm"
                className="border-secondary-subtle text-secondary"
                style={{ width: 'auto', cursor: 'pointer' }}
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </Form.Select>
              <span className="text-muted small ms-2">
                Showing {startIndex + 1} to {endIndex} of {totalContacts} contacts
              </span>
            </div>

            <div className="d-flex align-items-center gap-1">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                style={{ border: 'none' }}
                title="First Page"
              >
                <ChevronsLeft size={16} />
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                style={{ border: 'none' }}
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </Button>

              <span className="text-muted small mx-2">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                style={{ border: 'none' }}
                title="Next Page"
              >
                <ChevronRight size={16} />
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                style={{ border: 'none' }}
                title="Last Page"
              >
                <ChevronsRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
