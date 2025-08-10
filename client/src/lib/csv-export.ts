/**
 * Export municipality data as CSV file
 */
export async function exportMunicipalityCSV(municipalityId: string, municipalityName: string): Promise<void> {
  try {
    const response = await fetch(`/api/municipalities/${municipalityId}/export`);
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    const csvContent = await response.text();
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${municipalityName}_datos.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      throw new Error('CSV export not supported in this browser');
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw error;
  }
}

/**
 * Share municipality data URL
 */
export function shareMunicipality(municipalityName: string, municipalityProvince: string): string {
  const baseUrl = window.location.origin;
  const text = `Descubre los datos oficiales de ${municipalityName}, ${municipalityProvince} en Retrato de mi pueblo`;
  const url = window.location.href;
  
  return `${baseUrl}?municipality=${encodeURIComponent(municipalityName)}&province=${encodeURIComponent(municipalityProvince)}&text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}
