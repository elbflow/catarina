# Catarina — Data Model

## Entity Relationship Diagram

```mermaid
erDiagram
    FARMS {
        string id PK
        string name
        enum crop "apple | pecan | grape | berry"
        string location
        datetime createdAt
        datetime updatedAt
    }

    PEST_TYPES {
        string id PK
        string name
        enum crop "apple | pecan | grape | berry"
        number threshold
        text description
        datetime createdAt
        datetime updatedAt
    }

    PEST_OBSERVATIONS {
        string id PK
        date date
        number count
        string farm FK
        string pestType FK
        text notes
        string photo FK
        datetime createdAt
        datetime updatedAt
    }

    USERS {
        string id PK
        string email
        string password
        datetime createdAt
        datetime updatedAt
    }

    MEDIA {
        string id PK
        string filename
        string mimeType
        number filesize
        number width
        number height
        string url
        datetime createdAt
        datetime updatedAt
    }

    FARMS ||--o{ PEST_OBSERVATIONS : "has many"
    PEST_TYPES ||--o{ PEST_OBSERVATIONS : "has many"
    MEDIA ||--o| PEST_OBSERVATIONS : "attached to"
```

## Class Diagram (TypeScript types)

```mermaid
classDiagram
    class Farm {
        +string id
        +string name
        +CropType crop
        +string? location
        +Date createdAt
        +Date updatedAt
    }

    class PestType {
        +string id
        +string name
        +CropType crop
        +number threshold
        +string? description
        +Date createdAt
        +Date updatedAt
    }

    class PestObservation {
        +string id
        +Date date
        +number count
        +Farm | string farm
        +PestType | string pestType
        +string? notes
        +Media | string? photo
        +Date createdAt
        +Date updatedAt
    }

    class User {
        +string id
        +string email
        +string password
        +Date createdAt
        +Date updatedAt
    }

    class Media {
        +string id
        +string filename
        +string mimeType
        +number filesize
        +number width
        +number height
        +string url
        +Date createdAt
        +Date updatedAt
    }

    class CropType {
        <<enumeration>>
        apple
        pecan
        grape
        berry
    }

    class RiskLevel {
        <<enumeration>>
        safe
        warning
        danger
    }

    PestObservation --> Farm : belongs to
    PestObservation --> PestType : categorized by
    PestObservation --> Media : optional photo
    Farm --> CropType : crop type
    PestType --> CropType : applies to crop
```

## Data Flow Diagram

```mermaid
flowchart TB
    subgraph Frontend
        Dashboard[Dashboard Page]
        ObsForm[Observation Form]
    end

    subgraph API["Payload REST API"]
        FarmsAPI["/api/farms"]
        PestTypesAPI["/api/pest-types"]
        ObservationsAPI["/api/pest-observations"]
        SeedAPI["/api/seed"]
    end

    subgraph Database["PostgreSQL"]
        FarmsTable[(farms)]
        PestTypesTable[(pest_types)]
        ObservationsTable[(pest_observations)]
        UsersTable[(users)]
        MediaTable[(media)]
    end

    subgraph Logic
        RiskCalc[Risk Calculator]
        TrendAnalysis[Trend Analysis]
    end

    Dashboard -->|GET| FarmsAPI
    Dashboard -->|GET| PestTypesAPI
    Dashboard -->|GET| ObservationsAPI
    ObsForm -->|POST| ObservationsAPI

    FarmsAPI --> FarmsTable
    PestTypesAPI --> PestTypesTable
    ObservationsAPI --> ObservationsTable
    ObservationsAPI --> MediaTable

    SeedAPI -->|creates| FarmsTable
    SeedAPI -->|creates| PestTypesTable
    SeedAPI -->|creates| ObservationsTable

    ObservationsAPI --> RiskCalc
    ObservationsAPI --> TrendAnalysis
    RiskCalc --> Dashboard
    TrendAnalysis --> Dashboard
```

## Risk Calculation State Machine

```mermaid
stateDiagram-v2
    [*] --> Safe: count < 80% threshold

    Safe --> Warning: count >= 80% threshold
    Safe --> Safe: count < 80% threshold

    Warning --> Danger: count >= threshold
    Warning --> Safe: count < 80% threshold
    Warning --> Warning: 80% <= count < threshold

    Danger --> Warning: count < threshold AND >= 80%
    Danger --> Safe: count < 80% threshold
    Danger --> Danger: count >= threshold

    Safe: No action needed
    Warning: Monitor closely
    Danger: Action required
```

## Collection Field Details

### Farms
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | text | Yes | — | Farm name |
| `crop` | select | Yes | `apple` | Crop type (apple, pecan, grape, berry) |
| `location` | text | No | — | Optional location for future use |

### PestTypes
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | text | Yes | — | Pest name (e.g., "Codling Moth") |
| `crop` | select | Yes | `apple` | Associated crop type |
| `threshold` | number | Yes | `5` | Action threshold count |
| `description` | textarea | No | — | Optional pest description |

### PestObservations
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `date` | date | Yes | — | Observation date |
| `count` | number | Yes | — | Trap count (min: 0) |
| `farm` | relationship | Yes | — | Reference to Farm |
| `pestType` | relationship | Yes | — | Reference to PestType |
| `notes` | textarea | No | — | Optional notes |
| `photo` | upload | No | — | Optional photo (for future AI feature) |

---

## Notes

- All collections have automatic `id`, `createdAt`, and `updatedAt` fields from Payload CMS.
- Relationships are stored as IDs but can be populated to full objects with `depth` parameter.
- V1 uses open access control (`() => true`) for all operations — single-tenant demo mode.
- The `photo` field on PestObservations is prepared for V4 AI-assisted prefill feature.
