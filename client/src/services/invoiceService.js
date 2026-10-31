import api from './api.js';

export async function getInvoices(params = {}) {
  const res = await api.get('/invoices', { params });
  return res.data;
}

export async function getInvoiceById(id) {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
}

export async function createInvoice(data) {
  const res = await api.post('/invoices', data);
  return res.data;
}

export async function updateInvoice(id, data) {
  const res = await api.put(`/invoices/${id}`, data);
  return res.data;
}

export async function issueInvoice(id) {
  const res = await api.post(`/invoices/${id}/issue`);
  return res.data;
}

export async function voidInvoice(id, data = {}) {
  const res = await api.post(`/invoices/${id}/void`, data);
  return res.data;
}

export async function downloadInvoicePdf(id, filename = `invoice-${id}.pdf`) {
  const response = await api.get(`/invoices/${id}/pdf`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

