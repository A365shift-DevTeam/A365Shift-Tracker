import { useState, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Row, Col, Card, Badge, Button, Dropdown, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Edit, Trash2, MoreVertical, Check, X, Mail, Building } from 'lucide-react'
import { DndContext, pointerWithin, rectIntersection, KeyboardSensor, PointerSensor, useSensor, useSensors, useDroppable, DragOverlay, defaultDropAnimationSideEffects, MeasuringStrategy } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Helper to get initials
const getInitials = (name) => {
  if (!name) return '??'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
}

// Helper to get consistent color for avatar
const getAvatarColor = (name) => {
  const colors = ['bg-primary', 'bg-success', 'bg-danger', 'bg-warning', 'bg-info', 'bg-dark', 'bg-secondary']
  if (!name) return 'bg-secondary'
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const getColumnColor = (index) => {
  const colors = ['#3b82f6', '#f97316', '#22c55e', '#64748b', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length];
}

// DROPPABLE COLUMN WRAPPER
const DroppableColumn = ({ id, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: id })

  return (
    <div
      ref={setNodeRef}
      className={`kanban-body ${isOver ? 'kanban-drop-active' : ''}`}
      style={{
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isOver ? 'rgba(59,130,246,0.06)' : 'transparent',
        transition: 'background-color 0.2s',
        flexGrow: 1
      }}
    >
      {children}
    </div>
  )
}

// Shared card content renderer (used by both sortable card and drag overlay)
const CardContent = ({ contact, onEdit, onDelete, showActions = true }) => (
  <Card.Body className="p-3">
    <div className="d-flex justify-content-between align-items-start">
      <div className="flex-grow-1 pe-2" style={{ minWidth: 0 }}>
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className={`rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm ${getAvatarColor(contact.name)}`}
            style={{ width: '24px', height: '24px', fontSize: '10px', flexShrink: 0 }}>
            {getInitials(contact.name)}
          </div>
          <div className="kanban-card-title fw-semibold text-dark" title={contact.name}>
            {contact.name}
          </div>
        </div>

        {/* Fields */}
        <div className="d-flex flex-column gap-1">
          <div className="kanban-card-field small text-muted text-truncate">
            <span className="fw-medium">Type: </span>{contact.type || 'Contact'}
          </div>
          {contact.company && (
            <div className="kanban-card-field small text-muted text-truncate">
              <Building size={12} className="me-1" />{contact.company}
            </div>
          )}
          {contact.email && (
            <div className="kanban-card-field small text-muted text-truncate">
              <Mail size={12} className="me-1" />{contact.email}
            </div>
          )}
        </div>
      </div>

      {showActions && onEdit && onDelete && (
        <div className="kanban-card-actions d-flex flex-column gap-1 opacity-50 ms-1">
          <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
            <Edit size={14} className="cursor-pointer hover-primary" onClick={(e) => { e.stopPropagation(); onEdit(contact); }} />
          </OverlayTrigger>
          <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
            <Trash2 size={14} className="cursor-pointer hover-danger" onClick={(e) => { e.stopPropagation(); confirm('Delete?') && onDelete(contact.id); }} />
          </OverlayTrigger>
        </div>
      )}
    </div>
  </Card.Body>
)

// SORTABLE CARD COMPONENT (only used inside SortableContext, never in DragOverlay)
const SortableContactCard = ({ contact, onEdit, onDelete, onPreview }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: contact.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative',
    touchAction: 'none',
    ...(isDragging ? { pointerEvents: 'none' } : {})
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`contacts-kanban-card mb-2 border-0 shadow-sm ${isDragging ? 'kanban-card-dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent contact={contact} onEdit={onEdit} onDelete={onDelete} />
    </Card>
  )
}

// OVERLAY CARD (plain card, no useSortable — avoids duplicate ID registration)
const OverlayCard = ({ contact }) => (
  <Card
    className="contacts-kanban-card shadow-lg border-primary border-2 bg-white kanban-card-overlay"
    style={{ width: '300px', cursor: 'grabbing' }}
  >
    <CardContent contact={contact} showActions={false} />
  </Card>
)

export const KanbanView = ({
  contacts,
  columns,
  onContactUpdate,
  onEdit,
  onDelete,
  onPreview,
  onAddColumn,
  onEditColumn,
  onDeleteColumn
}) => {
  const [activeId, setActiveId] = useState(null)
  const [editingColumnId, setEditingColumnId] = useState(null)

  // Local edit states
  const [editedColumnTitle, setEditedColumnTitle] = useState('')
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [isAddingColumn, setIsAddingColumn] = useState(false)

  // Track overColumn during drag for visual feedback
  const [overColumn, setOverColumn] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Group contacts
  const groupedContacts = useMemo(() => {
    const groups = {}
    columns.forEach(col => groups[col] = [])
    contacts.forEach(c => {
      const s = c.status || columns[0]
      if (groups[s]) groups[s].push(c)
      else if (groups[columns[0]]) groups[columns[0]].push(c)
    })
    return groups
  }, [contacts, columns])

  // Find which column a contact belongs to
  const findColumnForContact = useCallback((contactId) => {
    for (const [col, items] of Object.entries(groupedContacts)) {
      if (items.some(c => c.id === contactId)) return col
    }
    return null
  }, [groupedContacts])

  // Resolve an over-id (could be a column name or a contact ID) to a column name
  const resolveOverColumn = useCallback((overId) => {
    if (!overId) return null
    const id = String(overId)
    if (columns.includes(id)) return id
    const contact = contacts.find(c => c.id === id)
    if (contact) return contact.status || columns[0]
    return null
  }, [columns, contacts])

  const customCollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return rectIntersection(args);
  }, []);

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
    document.body.style.cursor = 'grabbing'
  }

  const handleDragOver = (event) => {
    const { over } = event
    if (!over) {
      setOverColumn(null)
      return
    }
    const col = resolveOverColumn(over.id)
    setOverColumn(col)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)
    setOverColumn(null)
    document.body.style.cursor = ''

    if (!over) return

    const contactId = active.id
    const overId = String(over.id)
    let newStatus = null

    if (columns.includes(overId)) {
      newStatus = overId
    } else {
      const overContact = contacts.find(c => c.id === overId)
      if (overContact) {
        newStatus = overContact.status || columns[0]
      }
    }

    if (newStatus) {
      const contact = contacts.find(c => c.id === contactId)
      if (contact && contact.status !== newStatus) {
        onContactUpdate(contactId, { status: newStatus })
      }
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setOverColumn(null)
    document.body.style.cursor = ''
  }

  const saveColumnEdit = (col) => {
    if (editedColumnTitle.trim() && editedColumnTitle !== col) onEditColumn(col, editedColumnTitle.trim())
    setEditingColumnId(null); setEditedColumnTitle('');
  }
  const saveNewColumn = () => {
    if (newColumnTitle.trim()) { onAddColumn(newColumnTitle.trim()); setNewColumnTitle(''); setIsAddingColumn(false); }
  }

  const activeContact = activeId ? contacts.find(c => c.id === activeId) : null
  const activeContactColumn = activeId ? findColumnForContact(activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
    >
      <Row className="kanban-container g-3 flex-nowrap overflow-auto py-2">
        {columns.map((column, index) => {
          const isDropTarget = activeId && overColumn === column && activeContactColumn !== column

          return (
            <Col key={column} className="flex-grow-1" style={{ minWidth: '300px' }}>
              <div className={`kanban-column h-100 bg-white bg-opacity-50 rounded-3 border shadow-sm ${isDropTarget ? 'kanban-column-highlight' : 'border-light'}`}>
                {/* Header */}
                <div
                  className="kanban-header p-3 border-bottom d-flex justify-content-between align-items-center sticky-top bg-white rounded-top-3"
                  style={{ borderTop: `4px solid ${getColumnColor(index)}` }}
                >
                  {editingColumnId === column ? (
                    <div className="d-flex gap-1 w-100">
                      <Form.Control size="sm" value={editedColumnTitle} onChange={e => setEditedColumnTitle(e.target.value)} autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') saveColumnEdit(column) }} />
                      <Button size="sm" variant="success" onClick={() => saveColumnEdit(column)}><Check size={14} /></Button>
                      <Button size="sm" variant="danger" onClick={() => setEditingColumnId(null)}><X size={14} /></Button>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex align-items-center gap-2">
                        <h6 className="mb-0 fw-bold">{column}</h6>
                        <Badge bg="light" text="dark" className="border rounded-pill ms-1">{groupedContacts[column]?.length || 0}</Badge>
                      </div>
                      <Dropdown align="end">
                        <Dropdown.Toggle as="button" className="btn btn-sm btn-link text-muted p-0 no-arrow"><MoreVertical size={16} /></Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => { setEditingColumnId(column); setEditedColumnTitle(column) }}>Rename</Dropdown.Item>
                          <Dropdown.Item className="text-danger" onClick={() => onDeleteColumn(column)}>Delete</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </>
                  )}
                </div>

                {/* Droppable Area */}
                <DroppableColumn id={column}>
                  <div className="p-2 d-flex flex-column gap-2" style={{ minHeight: '100px' }}>
                    <SortableContext items={groupedContacts[column].map(c => c.id)} strategy={verticalListSortingStrategy}>
                      {groupedContacts[column].map(contact => (
                        <SortableContactCard
                          key={contact.id}
                          contact={contact}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onPreview={onPreview}
                        />
                      ))}
                    </SortableContext>
                    {groupedContacts[column].length === 0 && (
                      <div className="text-center text-muted py-4 small border-2 border-dashed rounded opacity-50 m-2">
                        Drop items here
                      </div>
                    )}
                  </div>
                </DroppableColumn>
              </div>
            </Col>
          )
        })}
      </Row>

      {/* DragOverlay: portaled to document.body to escape backdrop-filter containing block */}
      {createPortal(
        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
          {activeContact ? <OverlayCard contact={activeContact} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  )
}
