import { useState, useEffect, useMemo } from 'react'
import { Button, Dropdown, Form, Badge, Modal, Card, Row, Col } from 'react-bootstrap'
import {
  Plus, Filter, MoreVertical,
  ArrowUpDown, Check, X, Layers, User, Flag, Briefcase, Building, Phone, Edit, Settings, ArrowUpRight
} from 'lucide-react'
import { contactService } from '../../../services/contactService'
import { projectService } from '../../../services/api'

import { ListView } from './ListView'
import { KanbanView } from './KanbanView'
import { ChartView } from './ChartView'
import { ContactModal } from './ContactModal'
import { AIAssistModal } from './AIAssistModal'
import './Contacts.css'

const DEFAULT_STATUS_COLUMNS = ['Active', 'Inactive', 'Lead', 'Customer']

const Contacts = () => {
  const [contacts, setContacts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // View State
  const [viewMode, setViewMode] = useState('list') // 'list', 'kanban', 'chart'
  const [showContactModal, setShowContactModal] = useState(false)
  const [showAIAssist, setShowAIAssist] = useState(false)
  const [editingContact, setEditingContact] = useState(null)

  // Filter & Sort State (Project Page Style)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [filterValue, setFilterValue] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [groupBy, setGroupBy] = useState('status') // 'status', 'type', 'company'

  // Dynamic Columns State (for Kanban)
  const [statusColumns, setStatusColumns] = useState(DEFAULT_STATUS_COLUMNS)

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewingContact, setPreviewingContact] = useState(null)

  // Add Column Modal
  const [showAddColumnModal, setShowAddColumnModal] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')

  // Convert to Sales State
  const [showConvertModal, setShowConvertModal] = useState(false)
  const [convertingContact, setConvertingContact] = useState(null)
  const [convertType, setConvertType] = useState('Product')

  // Global Labels
  const productLabel = localStorage.getItem('app_product_label') || 'Product'
  const serviceLabel = localStorage.getItem('app_service_label') || 'Service'

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setIsLoading(true)
      const data = await contactService.getContacts()
      setContacts(data || [])
    } catch (error) {
      console.error('Error loading contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const total = contacts.length
    const leads = contacts.filter(c => c.status === 'Lead').length
    const customers = contacts.filter(c => c.status === 'Customer').length
    const uniqueCompanies = new Set(contacts.map(c => c.company).filter(Boolean)).size
    return { total, leads, customers, companies: uniqueCompanies }
  }, [contacts])

  // --- Dynamic Options for Filters ---
  const filterableColumns = [
    { id: 'status', name: 'Status' },
    { id: 'type', name: 'Type' },
    { id: 'company', name: 'Company' },
    { id: 'location', name: 'Location' }
  ]

  const getFilterOptions = (columnId) => {
    const values = new Set()
    contacts.forEach(c => {
      const val = c[columnId]
      if (val) values.add(val)
    })
    return Array.from(values).sort()
  }

  // --- Filtering & Sorting Logic ---
  const processedContacts = useMemo(() => {
    let filtered = [...contacts]

    // 1. Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(contact =>
        contact.name?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query)
      )
    }

    // 2. Filter (Project Style)
    if (filterBy !== 'all' && filterValue) {
      filtered = filtered.filter(contact => {
        const value = String(contact[filterBy] || '')
        return value.toLowerCase() === filterValue.toLowerCase()
      })
    }

    // 3. Sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || ''
      let bValue = b[sortBy] || ''

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    return filtered
  }, [contacts, searchQuery, filterBy, filterValue, sortBy, sortOrder])

  // --- Column Management (CRUD) ---
  const getActiveColumns = () => {
    if (groupBy === 'status') return statusColumns
    // For other groupings, generate columns dynamically
    const values = new Set()
    contacts.forEach(c => {
      if (c[groupBy]) values.add(c[groupBy])
    })
    if (values.size === 0) return ['Unassigned']
    return Array.from(values).sort()
  }

  const handleAddColumn = (newCol) => {
    if (groupBy === 'status') {
      if (newCol && !statusColumns.includes(newCol)) {
        setStatusColumns([...statusColumns, newCol])
      }
    } else {
      alert('Can only add columns when grouping by Status')
    }
  }

  const handleCreateColumnConfirm = () => {
    if (newColumnName.trim()) {
      handleAddColumn(newColumnName.trim())
      setNewColumnName('')
      setShowAddColumnModal(false)
    }
  }

  const handleEditColumn = (oldCol, newCol) => {
    if (groupBy === 'status') {
      // Update columns list
      setStatusColumns(prev => prev.map(c => c === oldCol ? newCol : c))
      // Update all contacts that had this status
      // Note: In a real app, you'd batch update via API. Here we assume generic update.
      // We can't easily update all contacts without backend support for batch, 
      // or we loop and update individually (inefficient but works for demo).
      const contactsToUpdate = contacts.filter(c => c.status === oldCol)
      contactsToUpdate.forEach(c => {
        handleTaskUpdate(c.id, { status: newCol }) // Optimistic update
      })
    } else {
      alert('Can only modify columns when grouping by Status')
    }
  }

  const handleDeleteColumn = (colToDelete) => {
    if (groupBy === 'status') {
      if (confirm(`Delete column "${colToDelete}"? Contacts in this column will be moved to default.`)) {
        setStatusColumns(prev => prev.filter(c => c !== colToDelete))
        // Move contacts to first available column or ''
        const fallback = statusColumns.find(c => c !== colToDelete) || 'Active'
        const contactsToMove = contacts.filter(c => c.status === colToDelete)
        contactsToMove.forEach(c => {
          handleTaskUpdate(c.id, { status: fallback })
        })
      }
    } else {
      alert('Can only delete columns when grouping by Status')
    }
  }

  // --- Handlers ---
  const handleCreateContact = () => {
    setEditingContact(null)
    setShowContactModal(true)
  }

  const handleEditContact = (contact) => {
    setEditingContact(contact)
    setShowContactModal(true)
  }

  const handlePreviewContact = (contact) => {
    setPreviewingContact(contact)
    setShowPreviewModal(true)
  }

  const handleSaveContact = async (contactData) => {
    try {
      if (editingContact) {
        await contactService.updateContact(editingContact.id, contactData)
      } else {
        await contactService.createContact(contactData)
      }
      await loadContacts()
      setShowContactModal(false)
      setEditingContact(null)
    } catch (error) {
      console.error('Error saving contact:', error)
      alert('Failed to save contact')
    }
  }

  const handleDeleteContact = async (contactId) => {
    try {
      await contactService.deleteContact(contactId)
      await loadContacts()
      setShowContactModal(false)
      setEditingContact(null)
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact')
    }
  }

  const handleTaskUpdate = async (contactId, updates) => {
    try {
      // Optimistic update locally
      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, ...updates } : c))
      await contactService.updateContact(contactId, updates)
      // await loadContacts() // No need to reload if optimistic is correct
    } catch (error) {
      console.error('Error updating contact:', error)
      loadContacts() // Revert on error
    }
  }

  const handleAIFilterApply = (filters) => {
    if (filters.status && filters.status !== 'all') {
      setFilterBy('status')
      setFilterValue(filters.status)
    }
  }

  // --- Convert to Sales ---
  const handleConvertToSales = (contact) => {
    setConvertingContact(contact)
    setConvertType('Product')
    setShowConvertModal(true)
  }

  const handleConfirmConvert = async () => {
    if (!convertingContact) return
    const c = convertingContact
    const today = new Date()
    const date = String(today.getDate()).padStart(2, '0')
    const year = String(today.getFullYear()).slice(-2)
    const brandCode = (c.company || 'A3').substring(0, 2).toUpperCase()
    const clientCode = (c.name || 'C').slice(-1).toUpperCase()
    const customId = `${date}${brandCode}${clientCode}${year}`

    const newProject = {
      activeStage: 0,
      history: [],
      type: convertType,
      rating: 4.0,
      delay: 0,
      title: `${c.name} - ${c.company || 'Direct'}`,
      clientName: c.name || 'New Client',
      brandingName: c.company || 'A365Shift',
      customId
    }

    try {
      await projectService.create(newProject)
      const typeLabel = convertType === 'Product' ? productLabel : serviceLabel
      alert(`✅ Contact "${c.name}" converted to a ${typeLabel} sales project!`)
      setShowConvertModal(false)
      setConvertingContact(null)
    } catch (error) {
      console.error('Error converting contact to sales:', error)
      alert('Failed to convert contact. Please try again.')
    }
  }

  if (isLoading && contacts.length === 0) {
    return (
      <div className="contacts-container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    )
  }

  return (
    <div className="contacts-container">

      {/* Stats Grid */}
      {/* Stats Grid - MATCHING IMAGE EXACTLY */}
      <div className="stats-grid mb-4">
        <div className="stat-card-new">
          <div className="stat-icon-box blue-soft">
            <User size={22} className="text-primary" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Contacts</span>
            <h3 className="stat-number">{stats.total}</h3>
          </div>
        </div>

        <div className="stat-card-new">
          <div className="stat-icon-box green-soft">
            <Flag size={22} className="text-success" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Leads</span>
            <h3 className="stat-number">{stats.leads}</h3>
          </div>
        </div>

        <div className="stat-card-new">
          <div className="stat-icon-box teal-soft">
            <Briefcase size={22} className="text-info" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Customers</span>
            <h3 className="stat-number">{stats.customers}</h3>
          </div>
        </div>

        <div className="stat-card-new">
          <div className="stat-icon-box purple-soft">
            <Building size={22} className="text-purple" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Companies</span>
            <h3 className="stat-number">{stats.companies}</h3>
          </div>
        </div>
      </div>

      {/* Header & Toolbar - MATCHING IMAGE EXACTLY */}
      <div className="contacts-toolbar-wrapper mb-4">
        <div className="d-flex align-items-center gap-4">
          <h3 className="mb-0 fw-bold text-dark">Contacts</h3>

          <div className="search-pill-container">
            <div className="search-pill">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input-clean"
              />
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 ms-auto">
          {/* Filter Icons */}
          <div className="icon-group me-3">
            <button title="Filter" className={`icon-btn-clean ${filterBy !== 'all' ? 'active' : ''}`}>
              <Filter size={18} />
            </button>
            <button title="Group By" className={`icon-btn-clean ${groupBy !== 'status' ? 'active' : ''}`}>
              <Layers size={18} />
            </button>
            <button title="Sort" className="icon-btn-clean">
              <ArrowUpDown size={18} />
            </button>
            <button title="Settings" className="icon-btn-clean">
              <Settings size={18} />
            </button>
          </div>

          <div className="vr h-50 my-auto opacity-25"></div>

          {/* View Toggle */}
          <div className="view-toggle-clean mx-3">
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 5v11" /><path d="M12 5v6" /><path d="M18 5v14" /></svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
              onClick={() => setViewMode('chart')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
            </button>
          </div>

          <Button
            className="btn-success-soft d-flex align-items-center gap-2"
            onClick={handleCreateContact}
          >
            <Plus size={18} /> Contact
          </Button>

          <Button
            className="btn-purple-soft d-flex align-items-center gap-2"
            onClick={() => setShowAIAssist(true)}
          >
            ✨ AI
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="contacts-content-wrapper">
        {viewMode === 'list' && (
          <ListView
            contacts={processedContacts}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(col) => {
              if (sortBy === col) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
              else { setSortBy(col); setSortOrder('asc'); }
            }}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onPreview={handlePreviewContact}
            onConvertToSales={handleConvertToSales}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanView
            contacts={processedContacts}
            columns={getActiveColumns()}
            onContactUpdate={(id, updates) => {
              // If grouped by something else, we might need to map the update key
              const key = groupBy; // 'status' or 'type' etc
              handleTaskUpdate(id, { [key]: updates.status }) // KanBanView passes 'status' property, but we map it to groupBy
            }}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onPreview={handlePreviewContact}
            onAddColumn={handleAddColumn}
            onEditColumn={handleEditColumn}
            onDeleteColumn={handleDeleteColumn}
          />
        )}

        {viewMode === 'chart' && (
          <ChartView contacts={processedContacts} />
        )}
      </div>

      {/* Modals */}
      <ContactModal
        show={showContactModal}
        onHide={() => { setShowContactModal(false); setEditingContact(null); }}
        contact={editingContact}
        onSave={handleSaveContact}
        onDelete={handleDeleteContact}
      />

      {/* PREVIEW MODAL - UPDATED */}
      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} centered size="md" className="contact-preview-modal">
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
              {previewingContact?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <Modal.Title className="fw-bold h5 mb-0">{previewingContact?.name}</Modal.Title>
              <span className="text-muted small">{previewingContact?.type || 'Contact'}</span>
            </div>
          </div>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          {previewingContact && (
            <div className="d-flex flex-column gap-4">
              {/* Compnay & Status */}
              <Row className="g-3">
                <Col xs={12}>
                  <div className="p-3 bg-light rounded-3 border border-light-subtle">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small fw-bold text-uppercase ls-1">Company</span>
                      <Badge bg={previewingContact.status === 'Active' ? 'success' : 'secondary'} className="px-3 py-1 rounded-pill">
                        {previewingContact.status}
                      </Badge>
                    </div>
                    <div className="d-flex align-items-center gap-2 text-dark fw-medium">
                      <Building size={16} className="text-muted" />
                      {previewingContact.company || 'No Company'}
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Contact Info */}
              <div>
                <h6 className="text-muted small fw-bold text-uppercase mb-3 ls-1">Contact Information</h6>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-box bg-white border rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                      <User size={16} className="text-secondary" />
                    </div>
                    <div>
                      <label className="d-block text-muted x-small">Email Address</label>
                      <span className="text-dark fw-medium">{previewingContact.email}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-box bg-white border rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                      <Phone size={16} className="text-secondary" />
                    </div>
                    <div>
                      <label className="d-block text-muted x-small">Phone Number</label>
                      <span className="text-dark fw-medium">{previewingContact.phone || 'Not Set'}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-box bg-white border rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
                      <Briefcase size={16} className="text-secondary" />
                    </div>
                    <div>
                      <label className="d-block text-muted x-small">Job Title</label>
                      <span className="text-dark fw-medium">{previewingContact.role || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4 pt-0">
          <Button variant="light" onClick={() => setShowPreviewModal(false)} className="flex-grow-1">Close</Button>
          <Button variant="primary" onClick={() => { setShowPreviewModal(false); handleEditContact(previewingContact); }} className="flex-grow-1">
            <Edit size={16} className="me-2" /> Edit Contact
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ADD COLUMN MODAL */}
      <Modal show={showAddColumnModal} onHide={() => setShowAddColumnModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h6 fw-bold">Add New Status</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          <Form.Group>
            <Form.Label className="small text-muted">Status Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Review"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateColumnConfirm()}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" size="sm" onClick={() => setShowAddColumnModal(false)}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleCreateColumnConfirm} disabled={!newColumnName.trim()}>Add Status</Button>
        </Modal.Footer>
      </Modal>

      {/* CONVERT TO SALES MODAL */}
      <Modal show={showConvertModal} onHide={() => setShowConvertModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="h6 fw-bold">Convert to Sales Client</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {convertingContact && (
            <div className="mb-3">
              <div className="d-flex align-items-center gap-2 mb-3 p-2 bg-light rounded-3">
                <div className="rounded-circle bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center fw-bold" style={{ width: 36, height: 36, fontSize: 14 }}>
                  {convertingContact.name?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="fw-bold small">{convertingContact.name}</div>
                  <div className="text-muted" style={{ fontSize: 11 }}>{convertingContact.company || 'No Company'}</div>
                </div>
              </div>
              <Form.Group>
                <Form.Label className="small text-muted fw-bold">Project Type</Form.Label>
                <Form.Select
                  value={convertType}
                  onChange={(e) => setConvertType(e.target.value)}
                >
                  <option value="Product">{productLabel}</option>
                  <option value="Service">{serviceLabel}</option>
                </Form.Select>
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" size="sm" onClick={() => setShowConvertModal(false)}>Cancel</Button>
          <Button variant="success" size="sm" onClick={handleConfirmConvert} className="d-flex align-items-center gap-1">
            <ArrowUpRight size={14} /> Convert
          </Button>
        </Modal.Footer>
      </Modal>

      <AIAssistModal
        show={showAIAssist}
        onHide={() => setShowAIAssist(false)}
        contacts={contacts}
        onApplyFilters={handleAIFilterApply}
        onCreateContact={() => { setShowAIAssist(false); handleCreateContact(); }}
      />

    </div>
  )
}

export default Contacts
