# RefriTec Frontend

A modern, responsive web application for managing service calls for RefriTec. This frontend application consumes a FastAPI backend for all data operations.

## Features

- **Homepage – Open Service Calls ("Chamados")**  
  - Paginated list of all "Aberto" chamados, sorted by creation or scheduled date.  
  - Color-coded items by status:  
    - Overdue (data_prevista < today) in red, showing "X dias de atraso."  
    - Due today in orange.  
    - Upcoming in green.  

- **Sidebar Navigation**  
  - **Clientes**  
    - **Criar Cliente:** Form for telephone, name, and address.  
    - **Buscar Cliente:** Search by name or telephone.  
    - **Client Details:** When selected, displays a paginated list of related service calls.  
  - **Estatísticas**  
    - Charts or cards with key metrics, for example:  
      - Total value of items in open service calls.  
      - Service calls by client or status.  

- **Chamado Detail & Edit**  
  - Display status, description, device, observations, and due date.  
  - "Edit" button to update status and observations via inline form.  
  - "Add Item" button opens a modal dialog with fields: description, quantity, unit value.  
  - List of items with edit and remove options.

## Tech Stack

- **Frontend Framework:** React with TypeScript
- **UI Library:** Material-UI (MUI)
- **State Management:** React Query (TanStack Query)
- **HTTP Client:** Axios
- **Routing:** React Router
- **Charts:** Recharts

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd front
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm start
   ```

### Configuration

The application is configured to connect to a backend API running at `http://localhost:8000` by default. If you need to change this, edit the `REACT_APP_API_URL` variable in a `.env` file:

```
REACT_APP_API_URL=http://your-api-url
```

## Project Structure

- `/src`
  - `/api` - API client and service functions
  - `/components` - Reusable UI components
    - `/chamados` - Service call components
    - `/clientes` - Client components
    - `/layout` - Layout components like sidebar and headers
    - `/statistics` - Statistics and chart components
  - `/hooks` - Custom React hooks
  - `/pages` - Page components
  - `/theme` - Theme configuration
  - `/types` - TypeScript type definitions
  - `/utils` - Utility functions

## Build for Production

To build the application for production:

```
npm run build
```

The production build will be in the `build` folder.

## License

This project is proprietary and owned by RefriTec.
