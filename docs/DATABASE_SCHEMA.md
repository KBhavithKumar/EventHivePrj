# EventHive Database Schema Documentation

## Overview

EventHive uses MongoDB as its primary database with Mongoose ODM for schema definition and validation. The database is designed to be modular, scalable, and future-proof with comprehensive relationships between entities.

## Database Architecture

### Design Principles
- **Modular Design**: Each model is self-contained with clear responsibilities
- **No Redundancy**: Data normalization with proper references
- **Scalability**: Optimized indexes and efficient queries
- **Data Integrity**: Comprehensive validation and constraints
- **Audit Trail**: Complete history tracking for critical operations
- **Performance**: Strategic use of virtuals, indexes, and aggregation

### Connection Configuration
- **Database**: MongoDB with Mongoose ODM
- **Connection Pool**: Maximum 10 connections
- **Timeout Settings**: 5s server selection, 45s socket timeout
- **Auto-Reconnection**: Enabled with graceful shutdown handling

## Core Models

### 1. User Model (`users` collection)

**Purpose**: Manages student/participant accounts and profiles

**Key Features**:
- Complete academic profile (stream, year, department)
- Event participation history with status tracking
- Skill management and resume storage
- Email verification and password reset
- Preference management for notifications

**Important Fields**:
```javascript
{
  firstName, lastName, email, password,
  studentId, stream, year, department,
  eventsParticipated: [{ event, status, role }],
  preferences: { emailNotifications, eventCategories }
}
```

**Indexes**: email, studentId, stream+year, accountStatus, eventsParticipated.event

### 2. Organization Model (`organizations` collection)

**Purpose**: Manages clubs, departments, and event organizing entities

**Key Features**:
- Multi-level approval workflow
- Contact management with primary/secondary contacts
- Social media integration
- Event organization tracking
- Settings for event management preferences

**Important Fields**:
```javascript
{
  name, description, officialEmail, password,
  type, category, approvalStatus,
  contacts: [{ name, designation, email, isPrimary }],
  eventsOrganized: [ObjectId],
  settings: { allowPublicEvents, requireApprovalForEvents }
}
```

**Indexes**: officialEmail, name, type+category, approvalStatus, accountStatus

### 3. Admin Model (`admins` collection)

**Purpose**: System administrators with role-based permissions

**Key Features**:
- Hierarchical role system (SUPER_ADMIN, ADMIN, MODERATOR)
- Granular permission management
- Action logging for audit trail
- Auto-permission assignment based on role

**Important Fields**:
```javascript
{
  firstName, lastName, email, password,
  employeeId, designation, department, role,
  permissions: { canManageUsers, canApproveOrganizations, ... },
  actionsPerformed: [{ action, targetType, targetId, timestamp }]
}
```

**Indexes**: email, employeeId, role, accountStatus, actionsPerformed.timestamp

### 4. Event Model (`events` collection)

**Purpose**: Central event management with comprehensive details

**Key Features**:
- Multi-format support (online, offline, hybrid)
- Eligibility criteria with stream/year/department filtering
- Registration management with custom fields
- Media and document management
- Analytics and metrics tracking
- SLA and approval workflow

**Important Fields**:
```javascript
{
  title, description, category, type,
  organizer, startDateTime, endDateTime,
  eligibility: { streams, years, departments, isOpenToAll },
  venue: { name, address, coordinates },
  registrationSettings: { requireApproval, additionalFields },
  analytics: { views, registrations, attendance, rating }
}
```

**Indexes**: organizer, category+type, status, startDateTime, eligibility fields

### 5. Participant Model (`participants` collection)

**Purpose**: Event registration and participation management

**Key Features**:
- Unique registration numbers
- Team management for group events
- Payment tracking and status
- Attendance monitoring with check-in/out
- Certificate generation tracking
- Status history for audit trail

**Important Fields**:
```javascript
{
  user, event, registrationNumber, status, role,
  team: { teamName, teamLeader, teamMembers },
  payment: { amount, status, transactionId },
  attendance: { checkedIn, checkInTime, attendancePercentage },
  certificate: { isEligible, certificateUrl, certificateNumber }
}
```

**Indexes**: user+event (unique), event+status, registrationNumber, payment.status

### 6. Notification Model (`notifications` collection)

**Purpose**: Multi-channel communication management

**Key Features**:
- Multi-type support (EMAIL, SMS, PUSH, IN_APP)
- Bulk targeting with criteria-based filtering
- Delivery tracking and analytics
- Template system with variables
- Scheduling and recurring notifications
- Retry mechanism for failed deliveries

**Important Fields**:
```javascript
{
  title, message, type, category,
  recipients: [{ user, status, sentAt, readAt }],
  targeting: { criteria: { streams, years, departments } },
  scheduling: { isScheduled, scheduledFor, recurringPattern },
  deliveryStatus: { totalRecipients, sentCount, openRate }
}
```

**Indexes**: type+category, status, recipients.user, scheduling.scheduledFor

### 7. Ticket Model (`tickets` collection)

**Purpose**: Support and help desk management

**Key Features**:
- Auto-generated ticket numbers
- SLA tracking with response/resolution times
- Multi-level escalation system
- Message threading with attachments
- Auto-close functionality
- Feedback and rating system

**Important Fields**:
```javascript
{
  ticketNumber, subject, description, category, priority,
  requester: { user, organization, contactEmail },
  assignedTo, status, resolution,
  messages: [{ sender, message, timestamp, attachments }],
  sla: { responseTime, resolutionTime },
  escalation: { isEscalated, escalationLevel }
}
```

**Indexes**: ticketNumber, status+priority, category, assignedTo, requester fields

## Relationships and References

### Primary Relationships
```
User ←→ Participant ←→ Event ←→ Organization
  ↓         ↓         ↓         ↓
Notification ← Ticket → Admin
```

### Reference Patterns
- **One-to-Many**: Organization → Events, Event → Participants
- **Many-to-Many**: User ↔ Events (through Participants)
- **Polymorphic**: Notifications can reference any entity type
- **Self-Referencing**: Admin actions reference other admins

## Data Validation and Constraints

### Email Validation
- Pattern: `/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/`
- Unique constraints on primary email fields
- Lowercase transformation

### Mobile Number Validation
- Pattern: `/^[\+]?[1-9][\d]{0,15}$/`
- International format support

### Password Security
- Minimum 8 characters
- Bcrypt hashing with salt rounds: 12
- Automatic hashing on save

### Date Validations
- Event end date must be after start date
- Registration dates must be logical sequence
- Established year cannot be in future

## Performance Optimizations

### Indexing Strategy
- **Compound Indexes**: For common query patterns (stream+year, type+category)
- **Sparse Indexes**: For optional unique fields (studentId)
- **Text Indexes**: For search functionality (planned)
- **TTL Indexes**: For temporary data (planned)

### Query Optimizations
- **Population**: Selective field population to reduce data transfer
- **Aggregation**: Complex analytics using MongoDB aggregation pipeline
- **Virtuals**: Computed fields without database storage
- **Lean Queries**: For read-only operations

### Caching Strategy (Planned)
- **Redis Integration**: For frequently accessed data
- **Query Result Caching**: For expensive aggregations
- **Session Storage**: For user authentication

## Security Measures

### Data Protection
- **Password Hashing**: Bcrypt with high salt rounds
- **Token Security**: Crypto-based verification tokens
- **Field Selection**: Sensitive fields excluded by default
- **Input Sanitization**: Mongoose validation and sanitization

### Access Control
- **Role-Based Permissions**: Granular admin permissions
- **Data Isolation**: Organization-specific data access
- **Audit Logging**: Complete action history for admins

## Backup and Recovery

### Backup Strategy
- **Daily Automated Backups**: Full database backup
- **Point-in-Time Recovery**: MongoDB replica set configuration
- **Data Export**: Structured export functionality for admins

### Data Retention
- **User Data**: Retained until account deletion
- **Event Data**: Archived after completion
- **Logs**: 1-year retention for audit trails
- **Notifications**: 6-month retention for delivery logs

## Migration and Versioning

### Schema Evolution
- **Backward Compatibility**: New fields with default values
- **Migration Scripts**: For structural changes
- **Version Tracking**: Schema version in database metadata

### Data Migration Tools
- **Import/Export**: CSV and JSON format support
- **Bulk Operations**: Efficient batch processing
- **Validation**: Pre-migration data validation

## Monitoring and Analytics

### Performance Metrics
- **Query Performance**: Slow query logging
- **Index Usage**: Index efficiency monitoring
- **Connection Pool**: Connection utilization tracking

### Business Metrics
- **User Engagement**: Event participation rates
- **Organization Activity**: Event creation and management
- **System Usage**: Feature adoption and usage patterns

## Future Enhancements

### Planned Features
- **Full-Text Search**: Elasticsearch integration
- **Real-Time Updates**: WebSocket integration
- **File Storage**: GridFS for large file handling
- **Data Analytics**: Advanced reporting and insights
- **API Rate Limiting**: Request throttling and quotas

### Scalability Considerations
- **Horizontal Scaling**: Sharding strategy for large datasets
- **Read Replicas**: For read-heavy workloads
- **Microservices**: Service decomposition for specific domains
- **Event Sourcing**: For critical business events

---

*This documentation is maintained alongside the codebase and should be updated with any schema changes.*
