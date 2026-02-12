import { useState, useEffect } from 'react'
import { Modal, Form, Button, Dropdown, InputGroup } from 'react-bootstrap'
import { Calendar, Clock, FileText, User, Building2, CheckCircle, Paperclip, ListChecks, Info } from 'lucide-react'

const getColumnIcon = (columnId) => {
  const iconMap = {
    'col-task': ListChecks,
    'col-start-datetime': Calendar,
    'col-end-datetime': Calendar,
    'col-notes': FileText,
    'col-name': User,
    'col-customer': CheckCircle,
    'col-site': Building2,
    'col-attachments': Paperclip
  }
  return iconMap[columnId] || FileText
}

const renderField = (column, value, onChange, errors) => {
  const fieldId = `field-${column.id}`
  const isRequired = column.required
  const hasError = !!errors[column.id]
  const IconComponent = getColumnIcon(column.id)
  const isDateTime = column.type === 'datetime' || column.type === 'date'

  switch (column.type) {
    case 'text':
      if (column.config?.multiline) {
        return (
          <Form.Group className="mb-3">
            <Form.Label className="timesheet-form-label d-flex align-items-center gap-2">
              <IconComponent size={16} className="text-muted" />
              <span className="fw-semibold">
                {column.name} {isRequired && <span className="text-danger">*</span>}
              </span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={value || ''}
              onChange={(e) => onChange(column.id, e.target.value)}
              isInvalid={hasError}
              placeholder={`Enter ${column.name.toLowerCase()}`}
              className="timesheet-form-control"
            />
            {hasError && (
              <Form.Control.Feedback type="invalid">
                {errors[column.id]}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        )
      }
      return (
        <Form.Group className="mb-3">
          <Form.Label className="timesheet-form-label d-flex align-items-center gap-2">
            <IconComponent size={16} className="text-muted" />
            <span className="fw-semibold">
              {column.name} {isRequired && <span className="text-danger">*</span>}
            </span>
          </Form.Label>
          <Form.Control
            type="text"
            value={value || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            isInvalid={hasError}
            disabled={column.config?.readOnly}
            placeholder={`Enter ${column.name.toLowerCase()}`}
            className="timesheet-form-control"
          />
          {hasError && (
            <Form.Control.Feedback type="invalid">
              {errors[column.id]}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      )

    case 'number':
      return (
        <Form.Group className="mb-3">
          <Form.Label className="timesheet-form-label d-flex align-items-center gap-2">
            <IconComponent size={16} className="text-muted" />
            <span className="fw-semibold">
              {column.name} {isRequired && <span className="text-danger">*</span>}
            </span>
          </Form.Label>
          <Form.Control
            type="number"
            value={value || ''}
            onChange={(e) => onChange(column.id, e.target.value ? Number(e.target.value) : '')}
            isInvalid={hasError}
            placeholder={`Enter ${column.name.toLowerCase()}`}
            className="timesheet-form-control"
          />
          {hasError && (
            <Form.Control.Feedback type="invalid">
              {errors[column.id]}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      )

    case 'datetime':
    case 'date': {
      const getLocalDateTime = (isoString) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        if (isNaN(date.getTime())) return ''
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        if (column.type === 'date') {
          return `${year}-${month}-${day}`
        }
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }

      return (
        <Form.Group className="mb-3">
          <Form.Label className="timesheet-form-label d-flex align-items-center gap-2">
            <IconComponent size={16} className="text-muted" />
            <span className="fw-semibold">
              {column.name} {isRequired && <span className="text-danger">*</span>}
            </span>
            {isDateTime && (
              <Info size={12} className="text-muted ms-1" />
            )}
          </Form.Label>
          <InputGroup className="timesheet-input-group">
            <Form.Control
              id={fieldId}
              type={column.type === 'date' ? 'date' : 'datetime-local'}
              value={getLocalDateTime(value)}
              onChange={(e) => {
                const localValue = e.target.value
                if (localValue) {
                  const date = new Date(localValue)
                  onChange(column.id, date.toISOString())
                } else {
                  onChange(column.id, '')
                }
              }}
              isInvalid={hasError}
              className="timesheet-form-control border-end-0"
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            />
            <InputGroup.Text
              className="bg-transparent border-start-0 text-muted"
              onClick={() => {
                const input = document.getElementById(fieldId)
                if (input && typeof input.showPicker === 'function') {
                  input.showPicker()
                }
              }}
              style={{
                cursor: 'pointer',
                borderColor: 'rgba(0, 0, 0, 0.12)',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderLeft: 'none'
              }}
            >
              <Calendar size={16} />
            </InputGroup.Text>
            {hasError && (
              <Form.Control.Feedback type="invalid">
                {errors[column.id]}
              </Form.Control.Feedback>
            )}
          </InputGroup>
        </Form.Group>
      )
    }

    case 'time': {
      const getLocalTime = (isoString) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        if (isNaN(date.getTime())) return ''
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      }

      return (
        <Form.Group className="mb-3">
          <Form.Label className="timesheet-form-label d-flex align-items-center gap-2">
            <IconComponent size={16} className="text-muted" />
            <span className="fw-semibold">
              {column.name} {isRequired && <span className="text-danger">*</span>}
            </span>
          </Form.Label>
          <Form.Control
            type="time"
            value={getLocalTime(value)}
            onChange={(e) => {
              const timeValue = e.target.value
              if (timeValue) {
                const [hours, minutes] = timeValue.split(':')
                const date = new Date()
                date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
                onChange(column.id, date.toISOString())
              } else {
                onChange(column.id, '')
              }
            }}
            isInvalid={hasError}
            className="timesheet-form-control"
          />
          {hasError && (
            <Form.Control.Feedback type="invalid">
              {errors[column.id]}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      )
    }

    case 'file':
      return (
        <Form.Group className="mb-3">
          <Form.Label className="timesheet-form-label d-flex align-items-center gap-2">
            <IconComponent size={16} className="text-muted" />
            <span className="fw-semibold">
              {column.name} {isRequired && <span className="text-danger">*</span>}
            </span>
          </Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) {
                const reader = new FileReader()
                reader.onloadend = () => {
                  onChange(column.id, reader.result)
                }
                reader.readAsDataURL(file)
              } else {
                onChange(column.id, null)
              }
            }}
            isInvalid={hasError}
            className="timesheet-form-control"
          />
          {value && (
            <div className="mt-2">
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary text-decoration-none" style={{ fontSize: '0.875rem' }}>
                View Current Attachment
              </a>
            </div>
          )}
          {hasError && (
            <Form.Control.Feedback type="invalid">
              {errors[column.id]}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      )

    case 'choice': {
      const options = column.config?.options || []
      const selectedOption = options.find(opt => {
        const optionValue = typeof opt === 'string' ? opt : opt.label || opt.value
        return optionValue === value
      })
      const displayValue = selectedOption
        ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label || selectedOption.value)
        : (value || `Select ${column.name.toLowerCase()}`)

      return (
        <Form.Group className="mb-3">
          <Form.Label className="timesheet-form-label d-flex align-items-center gap-2">
            <IconComponent size={16} className="text-muted" />
            <span className="fw-semibold">
              {column.name} {isRequired && <span className="text-danger">*</span>}
            </span>
          </Form.Label>
          <Dropdown>
            <Dropdown.Toggle
              className={`timesheet-dropdown-toggle w-100 ${hasError ? 'is-invalid' : ''}`}
              id={`choice-${column.id}`}
            >
              {displayValue}
            </Dropdown.Toggle>
            <Dropdown.Menu className="timesheet-dropdown-menu">
              <Dropdown.Item
                active={!value}
                onClick={() => onChange(column.id, '')}
              >
                Select {column.name.toLowerCase()}
              </Dropdown.Item>
              {options.map((opt, idx) => {
                const optionValue = typeof opt === 'string' ? opt : opt.label || opt.value
                return (
                  <Dropdown.Item
                    key={idx}
                    active={value === optionValue}
                    onClick={() => onChange(column.id, optionValue)}
                  >
                    {optionValue}
                  </Dropdown.Item>
                )
              })}
            </Dropdown.Menu>
          </Dropdown>
          {hasError && (
            <div className="invalid-feedback d-block">
              {errors[column.id]}
            </div>
          )}
        </Form.Group>
      )
    }

    default:
      return (
        <Form.Group className="mb-3">
          <Form.Label className="timesheet-form-label d-flex align-items-center gap-2">
            <IconComponent size={16} className="text-muted" />
            <span className="fw-semibold">
              {column.name} {isRequired && <span className="text-danger">*</span>}
            </span>
          </Form.Label>
          <Form.Control
            type="text"
            value={value || ''}
            onChange={(e) => onChange(column.id, e.target.value)}
            isInvalid={hasError}
            placeholder={`Enter ${column.name.toLowerCase()}`}
            className="timesheet-form-control"
          />
          {hasError && (
            <Form.Control.Feedback type="invalid">
              {errors[column.id]}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      )
  }
}

export const TimesheetModal = ({ show, onHide, entry, columns, onSave, onDelete }) => {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (show) {
      if (entry) {
        setFormData(entry.values || {})
      } else {
        const initialData = {}
        columns.forEach(col => {
          initialData[col.id] = col.config?.readOnly ? `TS-${Date.now()}` : ''
        })
        setFormData(initialData)
      }
      setErrors({})
    }
  }, [entry, columns, show])

  const handleChange = (columnId, value) => {
    setFormData(prev => ({
      ...prev,
      [columnId]: value
    }))
    if (errors[columnId]) {
      setErrors(prev => ({
        ...prev,
        [columnId]: null
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    columns.forEach(column => {
      if (column.required && !formData[column.id]) {
        newErrors[column.id] = `${column.name} is required`
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      onDelete(entry.id)
    }
  }

  const visibleColumns = columns.filter(col => col.visible !== false)

  const sortedColumns = [...visibleColumns].sort((a, b) => {
    const order = [
      'col-task',
      'col-start-datetime',
      'col-end-datetime',
      'col-notes',
      'col-name',
      'col-customer',
      'col-site',
      'col-attachments'
    ]
    const aIndex = order.indexOf(a.id)
    const bIndex = order.indexOf(b.id)
    if (aIndex === -1 && bIndex === -1) return 0
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="timesheet-edit-modal">
      <Modal.Header className="border-bottom pb-2">
        <Modal.Title className="mb-0">
          {entry ? 'Edit Timesheet Entry' : 'Create New Timesheet Entry'}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-3 pb-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="row g-3">
            {sortedColumns
              .filter(col => col.id !== 'col-id')
              .map(column => {
                const value = formData[column.id]
                const isNotes = column.id === 'col-notes'
                const colClass = isNotes ? 'col-12' : 'col-md-6'

                return (
                  <div key={column.id} className={colClass}>
                    {renderField(column, value, handleChange, errors)}
                  </div>
                )
              })}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-top pt-3">
          {entry && (
            <Button
              variant="outline-danger"
              onClick={handleDelete}
              className="me-auto"
            >
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {entry ? 'Update' : 'Create'} Entry
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
