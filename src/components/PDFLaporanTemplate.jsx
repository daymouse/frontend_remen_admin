import React from 'react';

const PDFLaporanTemplate = ({ 
  filteredPesanan, 
  totalPendapatan, 
  totalItemTerjual, 
  filters, 
  isFilterActive,
  formatCurrency 
}) => {
  // Format date untuk PDF
  const formatDatePDF = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date only untuk PDF
  const formatDateOnlyPDF = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div 
      id="pdf-template" 
      style={{ 
        width: '794px', 
        padding: '20px', 
        backgroundColor: 'white', 
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4'
      }}
    >
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '25px', 
        borderBottom: '2px solid #333', 
        paddingBottom: '15px' 
      }}>
        <h1 style={{ 
          margin: '0', 
          fontSize: '28px', 
          fontWeight: 'bold', 
          color: '#1f2937' 
        }}>
          LAPORAN PESANAN
        </h1>
        <p style={{ 
          margin: '8px 0 0 0', 
          color: '#6b7280', 
          fontSize: '14px' 
        }}>
          Dicetak pada: {new Date().toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
        {isFilterActive && (
          <p style={{ 
            margin: '5px 0 0 0', 
            color: '#d97706', 
            fontSize: '14px', 
            fontWeight: 'bold' 
          }}>
            ⚡ FILTER AKTIF DITERAPKAN
          </p>
        )}
      </div>

      {/* Informasi Filter */}
      {isFilterActive && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: '#fffbeb', 
          border: '1px solid #fcd34d',
          borderRadius: '6px'
        }}>
          <h3 style={{ 
            margin: '0 0 10px 0', 
            fontSize: '14px', 
            fontWeight: 'bold', 
            color: '#92400e' 
          }}>
            Filter yang Aktif:
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {filters.tanggalAwal && (
              <span style={{ 
                display: 'inline-block',
                padding: '4px 8px', 
                backgroundColor: '#fef3c7', 
                color: '#92400e',
                fontSize: '11px',
                borderRadius: '12px',
                border: '1px solid #f59e0b'
              }}>
                📅 Dari: {formatDateOnlyPDF(filters.tanggalAwal)}
              </span>
            )}
            {filters.tanggalAkhir && (
              <span style={{ 
                display: 'inline-block',
                padding: '4px 8px', 
                backgroundColor: '#fef3c7', 
                color: '#92400e',
                fontSize: '11px',
                borderRadius: '12px',
                border: '1px solid #f59e0b'
              }}>
                📅 Sampai: {formatDateOnlyPDF(filters.tanggalAkhir)}
              </span>
            )}
            {filters.hargaMin && (
              <span style={{ 
                display: 'inline-block',
                padding: '4px 8px', 
                backgroundColor: '#f0f9ff', 
                color: '#0c4a6e',
                fontSize: '11px',
                borderRadius: '12px',
                border: '1px solid #0ea5e9'
              }}>
                💰 Min: {formatCurrency(parseInt(filters.hargaMin))}
              </span>
            )}
            {filters.hargaMax && (
              <span style={{ 
                display: 'inline-block',
                padding: '4px 8px', 
                backgroundColor: '#f0f9ff', 
                color: '#0c4a6e',
                fontSize: '11px',
                borderRadius: '12px',
                border: '1px solid #0ea5e9'
              }}>
                💰 Max: {formatCurrency(parseInt(filters.hargaMax))}
              </span>
            )}
            {filters.produkId && (
              <span style={{ 
                display: 'inline-block',
                padding: '4px 8px', 
                backgroundColor: '#f3e8ff', 
                color: '#5b21b6',
                fontSize: '11px',
                borderRadius: '12px',
                border: '1px solid #8b5cf6'
              }}>
                📦 Filter Produk
              </span>
            )}
            {filters.userId && (
              <span style={{ 
                display: 'inline-block',
                padding: '4px 8px', 
                backgroundColor: '#f3e8ff', 
                color: '#5b21b6',
                fontSize: '11px',
                borderRadius: '12px',
                border: '1px solid #8b5cf6'
              }}>
                👤 Filter Petugas
              </span>
            )}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '15px', 
        marginBottom: '25px' 
      }}>
        <div style={{ 
          border: '1px solid #e5e7eb', 
          padding: '20px', 
          textAlign: 'center', 
          borderRadius: '8px',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            TOTAL PESANAN
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#1f2937' 
          }}>
            {filteredPesanan.length}
          </div>
        </div>
        
        <div style={{ 
          border: '1px solid #e5e7eb', 
          padding: '20px', 
          textAlign: 'center', 
          borderRadius: '8px',
          backgroundColor: '#f0fdf4'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            TOTAL PENDAPATAN
          </div>
          <div style={{ 
            fontSize: '22px', 
            fontWeight: 'bold', 
            color: '#059669' 
          }}>
            {formatCurrency(totalPendapatan)}
          </div>
        </div>
        
        <div style={{ 
          border: '1px solid #e5e7eb', 
          padding: '20px', 
          textAlign: 'center', 
          borderRadius: '8px',
          backgroundColor: '#fff7ed'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            marginBottom: '8px',
            fontWeight: '600'
          }}>
            ITEM TERJUAL
          </div>
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#ea580c' 
          }}>
            {totalItemTerjual}
          </div>
        </div>
      </div>

      {/* Tabel Pesanan */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ 
          margin: '0 0 15px 0', 
          fontSize: '16px', 
          fontWeight: 'bold', 
          color: '#1f2937',
          paddingBottom: '8px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          DAFTAR PESANAN ({filteredPesanan.length} items)
        </h3>
        
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '11px'
        }}>
          <thead>
            <tr style={{ 
              backgroundColor: '#f9fafb', 
              borderBottom: '2px solid #e5e7eb' 
            }}>
              <th style={{ 
                padding: '12px 8px', 
                textAlign: 'left', 
                fontWeight: 'bold', 
                color: '#374151',
                border: '1px solid #e5e7eb'
              }}>
                ID PESANAN
              </th>
              <th style={{ 
                padding: '12px 8px', 
                textAlign: 'left', 
                fontWeight: 'bold', 
                color: '#374151',
                border: '1px solid #e5e7eb'
              }}>
                TANGGAL
              </th>
              <th style={{ 
                padding: '12px 8px', 
                textAlign: 'left', 
                fontWeight: 'bold', 
                color: '#374151',
                border: '1px solid #e5e7eb'
              }}>
                PETUGAS
              </th>
              <th style={{ 
                padding: '12px 8px', 
                textAlign: 'center', 
                fontWeight: 'bold', 
                color: '#374151',
                border: '1px solid #e5e7eb'
              }}>
                ITEMS
              </th>
              <th style={{ 
                padding: '12px 8px', 
                textAlign: 'right', 
                fontWeight: 'bold', 
                color: '#374151',
                border: '1px solid #e5e7eb'
              }}>
                TOTAL
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPesanan.map((order, index) => (
              <tr 
                key={order.id} 
                style={{ 
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                }}
              >
                <td style={{ 
                  padding: '10px 8px', 
                  color: '#1f2937', 
                  fontWeight: 'bold',
                  border: '1px solid #e5e7eb'
                }}>
                  #{order.id}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  color: '#6b7280',
                  border: '1px solid #e5e7eb'
                }}>
                  {formatDatePDF(order.created_at)}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  color: '#1f2937',
                  border: '1px solid #e5e7eb'
                }}>
                  {order.petugas?.fullname || order.petugas?.username || 'Petugas'}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  color: '#6b7280', 
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}>
                  {order.items?.length || 0}
                </td>
                <td style={{ 
                  padding: '10px 8px', 
                  color: '#059669', 
                  fontWeight: 'bold', 
                  textAlign: 'right',
                  border: '1px solid #e5e7eb'
                }}>
                  {formatCurrency(order.total_harga)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ 
        borderTop: '2px solid #e5e7eb', 
        paddingTop: '15px', 
        marginTop: '25px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Menampilkan <strong>{filteredPesanan.length}</strong> pesanan
            {isFilterActive && <span style={{ color: '#9ca3af' }}> • Filter aktif</span>}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#1f2937', 
            fontWeight: 'bold' 
          }}>
            TOTAL PENDAPATAN: {formatCurrency(totalPendapatan)}
          </div>
        </div>
        <div style={{ 
          marginTop: '10px', 
          fontSize: '10px', 
          color: '#9ca3af', 
          textAlign: 'center',
          borderTop: '1px solid #f3f4f6',
          paddingTop: '8px'
        }}>
          Laporan dibuat secara otomatis • {new Date().toLocaleDateString('id-ID')}
        </div>
      </div>
    </div>
  );
};

export default PDFLaporanTemplate;