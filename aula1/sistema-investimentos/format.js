// Função de formatação de moeda universal (backend e frontend)
function formatCurrency(value) {
  if (isNaN(value)) return '$ 0.00';
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' }); 
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { formatCurrency };
} else {
  window.formatCurrency = formatCurrency;
} 