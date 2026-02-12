import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap'
import { X } from 'lucide-react'
import './BusinessProcessModal.css'

const BusinessProcessModal = ({
    show,
    handleClose,
    handleSave,
    projectId,
    stages = [],
    activeStage,
    targetStage,
    delay = 0
}) => {
    const initialStage = targetStage !== undefined ? targetStage : activeStage
    const [viewedStage, setViewedStage] = useState(initialStage)
    const [formData, setFormData] = useState({
        targetDate: '',
        revisedDate: '',
        amount: '',
        description: '',
        attachment: ''
    })

    useEffect(() => {
        if (show) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setViewedStage(targetStage !== undefined ? targetStage : activeStage)
        }
    }, [show, targetStage, activeStage])

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = () => {
        handleSave({
            stageIndex: viewedStage,
            ...formData
        })
        setFormData({
            targetDate: '',
            revisedDate: '',
            amount: '',
            description: '',
            attachment: ''
        })
    }

    if (!show) return null

    const currentStageLabel = stages[viewedStage]?.label || 'Stage'

    // Use Portal to render outside of the local stacking context (which has transforms/z-index issues)
    return createPortal(
        <div className="business-process-overlay">
            {/* HEADER */}
            <div className="bp-modal-header">
                <div className="header-content">
                    Business Process – Project ID {projectId} —{' '}
                    {delay > 0 ? `Delay ${delay} Days` : 'On Track'}
                </div>
                <button className="bp-close-btn" onClick={handleClose}>
                    <X size={24} />
                </button>
            </div>

            {/* BODY */}
            <div className="bp-content-body">
                <Row className="g-0 h-100">
                    {/* LEFT SIDEBAR */}
                    <Col md={2} className="bp-sidebar">
                        {stages.map((stage, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`bp-stage-btn ${index === viewedStage ? 'active' : ''}`}
                                onClick={() => setViewedStage(index)}
                            >
                                {stage.label}
                            </button>
                        ))}
                    </Col>

                    {/* CENTER FORM */}
                    <Col md={5} className="bp-form-section">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Target Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.targetDate}
                                    onChange={e => handleFormChange('targetDate', e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Revised Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.revisedDate}
                                    onChange={e => handleFormChange('revisedDate', e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Amount</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Enter amount"
                                    value={formData.amount}
                                    onChange={e => handleFormChange('amount', e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    value={formData.description}
                                    placeholder={`Enter details for ${currentStageLabel}...`}
                                    onChange={e => handleFormChange('description', e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Attachment</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="File path or URL"
                                    value={formData.attachment}
                                    onChange={e => handleFormChange('attachment', e.target.value)}
                                />
                            </Form.Group>

                            <div className="d-flex gap-3">
                                <Button variant="primary" onClick={handleSubmit}>
                                    Save
                                </Button>
                                <Button variant="outline-secondary" onClick={handleClose}>
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    </Col>

                    {/* RIGHT STATUS */}
                    <Col md={5} className="bp-status-section">
                        <h6>Status History</h6>
                        <p className="text-muted">
                            History and logs for {currentStageLabel} will appear here.
                        </p>
                    </Col>
                </Row>
            </div>
        </div>,
        document.body
    )
}

export default BusinessProcessModal
