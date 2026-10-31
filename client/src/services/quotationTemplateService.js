import api from './api.js';

export async function getQuotationTemplates(params = {}) {
  const res = await api.get('/quotation-templates', { params });
  return res.data;
}

export async function getQuotationTemplateById(id) {
  const res = await api.get(`/quotation-templates/${id}`);
  return res.data;
}

export async function createQuotationTemplate(data) {
  const res = await api.post('/quotation-templates', data);
  return res.data;
}

export async function updateQuotationTemplate(id, data) {
  const res = await api.put(`/quotation-templates/${id}`, data);
  return res.data;
}

export async function toggleQuotationTemplateStatus(id) {
  const res = await api.patch(`/quotation-templates/${id}/status`);
  return res.data;
}

