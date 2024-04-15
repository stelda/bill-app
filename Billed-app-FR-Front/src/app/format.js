export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const ye = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date)
  const mo = new Intl.DateTimeFormat('fr', { month: 'short' }).format(date)
  const da = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date)
  const month = mo.charAt(0).toUpperCase() + mo.slice(1)
  return `${parseInt(da)} ${month.substr(0,3)}. ${ye.toString().substr(2,4)}`
}

export const convertDateToISO = (formattedDate) => {
  const months = {
    'Jan.': '01', 'Fév.': '02', 'Mar.': '03', 'Avr.': '04',
    'Mai.': '05', 'Jui.': '06', 'Juil.': '07', 'Aoû.': '08',
    'Sep.': '09', 'Oct.': '10', 'Nov.': '11', 'Déc.': '12'
  };
  const parts = formattedDate.split(' ');
  const day = parts[0];
  const month = months[parts[1]];
  const year = '20' + parts[2];
  return `${year}-${month}-${day.padStart(2, '0')}`;
};

export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refusé"
  }
}