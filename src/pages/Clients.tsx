
// This component needs fixing to ensure that created clients have a name
// In the client creation function, we need to ensure name is required

// The specific line with the issue is where a new client is created without a required name field
// We need to make sure that when a new client is created:
//   1. The name is set as a required field and not optional
//   2. The client object follows the Client interface structure

// Fix for Clients.tsx
// When creating a new client:
const newClient: Client = {
  id: String(Date.now()),
  name: formData.name || 'Unnamed Client', // Ensure name is not empty
  email: formData.email || '',
  phone: formData.phone || '',
  document: formData.document,
  address: formData.address,
  city: formData.city,
  state: formData.state,
  zipCode: formData.zipCode,
  role: 'client',
  createdAt: new Date(),
  contracts: []
};
