import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, InputNumber, Select, Spin, message, List, Tag } from 'antd';
import { PlusOutlined, PrinterOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import axios from 'axios';
import moment from 'moment';

const { Item } = Form;
const { Option } = Select;

const ReporteGanancias = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [properties, setProperties] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [editingField, setEditingField] = useState('');
  const [formEdit] = Form.useForm();
  const [servicesList, setServicesList] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [filteredMaintenance, setFilteredMaintenance] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState([]);

  const token = useSelector(state => state.authSlice?.accessToken);

  const formatDate = (dateString) => {
    return dateString ? moment(dateString).format('DD/MM/YYYY') : 'Sin fecha';
  };

  const extractMaintenanceAmount = (category) => {
    if (!category) return 0;
    
    const amountMatch = category.match(/(\$?\s*)([\d.,]+)/);
    if (!amountMatch) return 0;
    
    const amountString = amountMatch[2]
      .replace(/\./g, '')
      .replace(',', '.');
      
    const amount = parseFloat(amountString);
    return isNaN(amount) ? 0 : amount;
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
        const response = await axios.get(`${apiUrl}/properties`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProperties(response.data.data || []);
      } catch (error) {
        message.error('Error al cargar propiedades');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [token]);

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
      const response = await axios.get(`${apiUrl}/expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServicesList(response.data.data || []);
    } catch (error) {
      message.error('Error al cargar servicios');
      console.error('Error:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchMaintenance = async () => {
    setLoadingMaintenance(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
      const response = await axios.get(`${apiUrl}/maintenance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMaintenanceList(response.data.data || []);
    } catch (error) {
      message.error('Error al cargar mantenimientos');
      console.error('Error:', error);
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const getPropertyTitleByUnitId = (unitId) => {
    const property = properties.find(p => 
      p.units?.some(u => u.id === unitId)
    );
    return property?.title || `Unidad ${unitId}`;
  };

  const handleModalOpen = () => {
    setModalVisible(true);
    fetchServices();
    fetchMaintenance();
    setSelectedServices([]);
    setSelectedMaintenance([]);
  };

  const calcularSumaServicios = (servicios) => {
    return servicios.reduce((total, servicio) => total + (servicio.amount || 0), 0);
  };

  const isEditing = (record, dataIndex) => record.key === editingKey && editingField === dataIndex;

  const handleDoubleClick = (record, dataIndex) => {
    if (record.key === 'total' || dataIndex === 'total') return;
    formEdit.setFieldsValue({ [dataIndex]: record[dataIndex] });
    setEditingKey(record.key);
    setEditingField(dataIndex);
  };

  const handleSave = (key) => {
    formEdit.validateFields().then(values => {
      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        const updatedItem = {
          ...item,
          [editingField]: values[editingField],
          total: (values[editingField] || 0) + 
                 (editingField !== 'servicios' ? item.servicios || 0 : 0) + 
                 (editingField !== 'mantenimiento' ? item.mantenimiento || 0 : 0),
        };
        newData.splice(index, 1, updatedItem);
        setData(newData);
        setEditingKey('');
        setEditingField('');
      }
    }).catch(error => {
      console.error('Error al validar:', error);
    });
  };

  const calcularTotal = (record) => {
    return (record.alquiler || 0) + (record.servicios || 0) + (record.mantenimiento || 0);
  };

  const toggleServiceSelection = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const toggleMaintenanceSelection = (maintenance) => {
    setSelectedMaintenance(prev => {
      const isSelected = prev.some(m => m.id === maintenance.id);
      if (isSelected) {
        return prev.filter(m => m.id !== maintenance.id);
      } else {
        return [...prev, maintenance];
      }
    });
  };

  const agregarRegistroManual = () => {
    form.validateFields().then(values => {
      const selectedProperty = properties.find(prop => prop.id === values.propiedad);
      
      const serviciosTotales = selectedServices.reduce(
        (sum, service) => sum + (service.amount || 0), 0
      );

      const mantenimientoTotales = selectedMaintenance.reduce(
        (sum, maint) => sum + extractMaintenanceAmount(maint.category), 0
      );

      const nuevoRegistro = {
        key: Date.now().toString(),
        propiedad: selectedProperty?.title || 'Manual',
        alquiler: values.alquiler || 0,
        servicios: serviciosTotales,
        mantenimiento: mantenimientoTotales,
        total: (values.alquiler || 0) + serviciosTotales + mantenimientoTotales,
        currency: 'ARS'
      };
      
      setData(prevData => [...prevData, nuevoRegistro]);
      form.resetFields();
      setModalVisible(false);
      setFilteredServices([]);
      setFilteredMaintenance([]);
      setSelectedServices([]);
      setSelectedMaintenance([]);
    }).catch(error => {
      console.error('Error al agregar registro:', error);
    });
  };

  const actualizarTotales = (currentData) => {
    return currentData.filter(item =>
      item?.key &&
      (item.propiedad?.trim() !== '') &&
      ((item.alquiler || 0) > 0 || (item.servicios || 0) > 0 || (item.mantenimiento || 0) > 0 || (item.total || 0) > 0)
    );
  };

  const handleImprimir = () => {
    const dataToPrint = actualizarTotales(data);

    if (dataToPrint.length === 0) {
      message.warning('No hay datos para imprimir.');
      return;
    }

    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString('es-AR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    let tableRowsHtml = '';
    dataToPrint.forEach(record => {
      tableRowsHtml += `
        <tr>
          <td>${record.propiedad || '-'}</td>
          <td class="text-center">$${(record.alquiler || 0).toLocaleString('es-AR')}</td>
          <td class="text-center">$${(record.servicios || 0).toLocaleString('es-AR')}</td>
          <td class="text-center">$${(record.mantenimiento || 0).toLocaleString('es-AR')}</td>
          <td class="text-center font-bold">$${(record.total || calcularTotal(record)).toLocaleString('es-AR')}</td>
        </tr>
      `;
    });

    const totalAlquiler = dataToPrint.reduce((sum, item) => sum + (item.alquiler || 0), 0);
    const totalServicios = dataToPrint.reduce((sum, item) => sum + (item.servicios || 0), 0);
    const totalMantenimiento = dataToPrint.reduce((sum, item) => sum + (item.mantenimiento || 0), 0);
    const grandTotal = dataToPrint.reduce((sum, item) => sum + (item.total || calcularTotal(item)), 0);

    tableRowsHtml += `
      <tr class="total-row">
        <td><strong>TOTAL</strong></td>
        <td class="text-center"><strong>$${totalAlquiler.toLocaleString('es-AR')}</strong></td>
        <td class="text-center"><strong>$${totalServicios.toLocaleString('es-AR')}</strong></td>
        <td class="text-center"><strong>$${totalMantenimiento.toLocaleString('es-AR')}</strong></td>
        <td class="text-center"><strong>$${grandTotal.toLocaleString('es-AR')}</strong></td>
      </tr>
    `;

    const printStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          margin: 30px;
          color: #333;
          line-height: 1.6;
        }
        h1 {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 10px;
          font-size: 2.2em;
          font-weight: 700;
        }
        .report-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #e0e0e0;
          padding-bottom: 15px;
        }
        .report-header p {
          color: #555;
          font-size: 1.1em;
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 25px;
          font-size: 0.95em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        th, td {
          border: 1px solid #e0e0e0;
          padding: 12px 15px;
          text-align: left;
        }
        th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          text-transform: uppercase;
        }
        tr:nth-child(even) {
          background-color: #fdfdfd;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .text-center {
          text-align: center;
        }
        .font-bold {
          font-weight: 700;
        }
        .total-row {
          background-color: #e9ecef !important;
          font-weight: 700;
          color: #212529;
        }
        .total-row td {
          border-top: 2px solid #adb5bd;
          padding-top: 15px;
          padding-bottom: 15px;
        }
        @media print {
          body {
            margin: 0;
            padding: 20px;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Ganancias</title>
          ${printStyles}
        </head>
        <body>
          <div class="report-header">
            <h1>Reporte de Ganancias</h1>
            <p><strong>Fecha del Reporte:</strong> ${currentDate}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Propiedad</th>
                <th class="text-center">Alquiler</th>
                <th class="text-center">Servicios Básicos</th>
                <th class="text-center">Mantenimiento</th>
                <th class="text-center">Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePropertySelectChange = (propertyId) => {
    const property = properties.find(p => p.id === propertyId);
    const unitIds = property?.units?.map(u => u.id) || [];

    const servicios = servicesList.filter(s => unitIds.includes(s.unitId));
    setFilteredServices(servicios);
    setSelectedServices([]);

    const mantenimientos = maintenanceList
      .filter(m => unitIds.includes(m.unitId))
      .map(m => ({
        ...m,
        parsedAmount: extractMaintenanceAmount(m.category)
      }));
    
    setFilteredMaintenance(mantenimientos);
    setSelectedMaintenance([]);

    form.setFieldsValue({
      alquiler: property?.units?.[0]?.rentalPrice || 0,
      servicios: 0,
      mantenimiento: 0,
      total: property?.units?.[0]?.rentalPrice || 0
    });
  };

  const EditableCell = ({ children, dataIndex, record, handleDoubleClick, editing, ...restProps }) => (
    <td {...restProps} onDoubleClick={() => handleDoubleClick(record, dataIndex)} className={editing ? 'bg-blue-50' : ''}>
      {children}
    </td>
  );

  const components = {
    body: {
      cell: EditableCell,
    },
  };

  // Función para eliminar un registro
  const handleDelete = (key) => {
    setData(prevData => prevData.filter(item => item.key !== key));
    message.success('Registro eliminado correctamente');
  };

  const columns = [
    {
      title: 'Propiedad',
      dataIndex: 'propiedad',
      key: 'propiedad',
      fixed: 'left',
      className: 'font-medium',
      render: (text) => text || '-'
    },
    {
      title: 'Alquiler',
      dataIndex: 'alquiler',
      key: 'alquiler',
      className: 'text-right',
      onCell: (record) => ({
        record, dataIndex: 'alquiler', editing: isEditing(record, 'alquiler'), handleDoubleClick
      }),
      render: (text, record) => isEditing(record, 'alquiler') ? (
        <Item name="alquiler" style={{ margin: 0 }}>
          <InputNumber
            autoFocus min={0}
            formatter={val => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={val => val.replace(/\$\s?|(,*)/g, '')}
            className="w-full"
            onPressEnter={() => handleSave(record.key)}
            onBlur={() => handleSave(record.key)}
          />
        </Item>
      ) : `$${text?.toLocaleString('es-AR') || '0'}`
    },
    {
      title: 'Servicios Básicos',
      dataIndex: 'servicios',
      key: 'servicios',
      className: 'text-right',
      onCell: (record) => ({
        record, dataIndex: 'servicios', editing: isEditing(record, 'servicios'), handleDoubleClick
      }),
      render: (text, record) => isEditing(record, 'servicios') ? (
        <Item name="servicios" style={{ margin: 0 }}>
          <InputNumber
            autoFocus min={0}
            formatter={val => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={val => val.replace(/\$\s?|(,*)/g, '')}
            className="w-full"
            onPressEnter={() => handleSave(record.key)}
            onBlur={() => handleSave(record.key)}
          />
        </Item>
      ) : `$${text?.toLocaleString('es-AR') || '0'}`
    },
    {
      title: 'Mantenimiento',
      dataIndex: 'mantenimiento',
      key: 'mantenimiento',
      className: 'text-right',
      onCell: (record) => ({
        record, dataIndex: 'mantenimiento', editing: isEditing(record, 'mantenimiento'), handleDoubleClick
      }),
      render: (text, record) => isEditing(record, 'mantenimiento') ? (
        <Item name="mantenimiento" style={{ margin: 0 }}>
          <InputNumber
            autoFocus min={0}
            formatter={val => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={val => val.replace(/\$\s?|(,*)/g, '')}
            className="w-full"
            onPressEnter={() => handleSave(record.key)}
            onBlur={() => handleSave(record.key)}
          />
        </Item>
      ) : `$${text?.toLocaleString('es-AR') || '0'}`
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      className: 'text-right font-bold',
      render: (text) => `$${text?.toLocaleString('es-AR') || '0'}`
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.key)}
          disabled={editingKey !== ''}
        />
      ),
    }
  ];

  return (
    <div className="p-4 sm:p-5 bg-white rounded-lg shadow-md">
      <div className="mb-4 sm:mb-5">
        <h2 className="text-xl font-semibold text-gray-800">Reporte de Ganancias</h2>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between no-print space-y-2 sm:space-y-0">
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleModalOpen} 
          className="bg-blue-600 hover:bg-blue-700" 
          disabled={editingKey !== ''}
        >
          Agregar Registro
        </Button>
        <Button 
          type="primary" 
          icon={<PrinterOutlined />} 
          onClick={handleImprimir} 
          className="bg-green-600 hover:bg-green-700" 
          disabled={loading || data.length === 0}
        >
          Imprimir Reporte
        </Button>
      </div>

      <Spin spinning={loading}>
        <Form form={formEdit} component={false}>
          <div id="reporte-table" className="relative">
            <Table
              components={components}
              columns={columns}
              dataSource={data}
              pagination={false}
              scroll={{ x: 'max-content' }}
              rowClassName={(record) => record.key === editingKey ? 'editing' : ''}
              className="w-full"
              locale={{ emptyText: 'La tabla está vacía. Haz clic en "Agregar Registro" para comenzar.' }}
              summary={() => {
                const totalAlquiler = data.reduce((sum, item) => sum + (item.alquiler || 0), 0);
                const totalServicios = data.reduce((sum, item) => sum + (item.servicios || 0), 0);
                const totalMantenimiento = data.reduce((sum, item) => sum + (item.mantenimiento || 0), 0);
                const grandTotal = data.reduce((sum, item) => sum + (item.total || calcularTotal(item)), 0);
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      {columns.map((col, index) => {
                        let content = null;
                        if (col.key === 'propiedad') content = 'TOTAL';
                        else if (col.key === 'alquiler') content = `$${totalAlquiler.toLocaleString('es-AR')}`;
                        else if (col.key === 'servicios') content = `$${totalServicios.toLocaleString('es-AR')}`;
                        else if (col.key === 'mantenimiento') content = `$${totalMantenimiento.toLocaleString('es-AR')}`;
                        else if (col.key === 'total') content = `$${grandTotal.toLocaleString('es-AR')}`;
                        else if (col.key === 'actions') content = null;
                        return (
                          <Table.Summary.Cell
                            key={col.key}
                            index={index}
                            className={col.className}
                            style={{
                              fontWeight: 'bold',
                              backgroundColor: '#f9f9f9',
                              border: '1px solid black',
                              textAlign: col.className?.includes('text-right') ? 'right' : 'left',
                            }}
                          >
                            {content}
                          </Table.Summary.Cell>
                        );
                      })}
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>
        </Form>
      </Spin>

      <Modal
        title="Agregar Registro"
        visible={modalVisible}
        onOk={agregarRegistroManual}
        onCancel={() => {
          setModalVisible(false);
          setSelectedServices([]);
          setSelectedMaintenance([]);
        }}
        width={800}
        okText="Aceptar"
        okButtonProps={{
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        }}
        cancelButtonProps={{
          className: 'bg-gray-400 hover:bg-gray-500 text-white'
        }}
      >
        <Form form={form} layout="vertical">
          <Item name="propiedad" label="Propiedad" rules={[{ required: true, message: 'Seleccione una propiedad' }]}>
            <Select
              placeholder="Seleccionar propiedad"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
              onChange={handlePropertySelectChange}
            >
              {properties.map(prop => (
                <Option key={prop.id} value={prop.id}>{prop.title}</Option>
              ))}
            </Select>
          </Item>
          <Item name="alquiler" label="Alquiler ($)" rules={[{ required: true }]}>
            <InputNumber 
              className="w-full" 
              min={0}
              formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={v => v.replace(/\$\s?|(,*)/g, '')}
              onChange={(value) => {
                const servicios = form.getFieldValue('servicios') || 0;
                const mantenimiento = form.getFieldValue('mantenimiento') || 0;
                form.setFieldValue('total', value + servicios + mantenimiento);
              }}
            />
          </Item>
          
          <Item label="Servicios Básicos">
            {filteredServices.length > 0 ? (
              <List
                size="small"
                bordered
                dataSource={filteredServices}
                renderItem={service => (
                  <List.Item 
                    onClick={() => toggleServiceSelection(service)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedServices.some(s => s.id === service.id) ? '#e6f7ff' : 'inherit'
                    }}
                  >
                    <div className="w-full">
                      <div className="flex justify-between items-center">
                        <div>
                          <div>{service.title}</div>
                          <div className="text-xs text-gray-500">
                            {getPropertyTitleByUnitId(service.unitId)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span>${service.amount?.toLocaleString('es-AR')}</span>
                          <Tag color="blue" className="mt-1">
                            {formatDate(service.date)}
                          </Tag>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
                footer={
                  <div className="flex justify-between font-medium">
                    <span>Total servicios seleccionados:</span>
                    <span>
                      ${calcularSumaServicios(selectedServices).toLocaleString('es-AR')}
                    </span>
                  </div>
                }
              />
            ) : (
              <div className="text-center py-4 text-gray-500">
                No hay servicios registrados para esta propiedad
              </div>
            )}
          </Item>

          <Item label="Mantenimientos Pendientes">
            {filteredMaintenance.length > 0 ? (
              <List
                size="small"
                bordered
                dataSource={filteredMaintenance}
                renderItem={maint => (
                  <List.Item
                    onClick={() => toggleMaintenanceSelection(maint)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedMaintenance.some(m => m.id === maint.id) ? '#e6f7ff' : 'inherit'
                    }}
                  >
                    <div className="w-full">
                      <div className="flex justify-between">
                        <div>
                          <strong>{maint.title}</strong>
                          <div className="text-xs text-gray-600">
                            {getPropertyTitleByUnitId(maint.unitId) && 
                              `Propiedad: ${getPropertyTitleByUnitId(maint.unitId)}`}
                            {maint.notes && <div className="mt-1">{maint.notes}</div>}
                          </div>
                        </div>
                        <div className="flex items-end">
                          <span>{formatCurrency(extractMaintenanceAmount(maint.category))}</span>
                        </div>
                      </div>
                      <div className="mt-1 text-xs">
                        <span className="font-semibold">Categoría original:</span> {maint.category}
                      </div>
                    </div>
                  </List.Item>
                )}
                footer={
                  <div className="flex justify-between font-bold">
                    <span>Total mantenimientos seleccionados:</span>
                    <span>
                      {formatCurrency(
                        selectedMaintenance.reduce(
                          (sum, m) => sum + extractMaintenanceAmount(m.category), 
                          0
                        )
                      )}
                    </span>
                  </div>
                }
              />
            ) : (
              <div className="text-center py-4 text-gray-500">
                No hay mantenimientos pendientes para esta propiedad
              </div>
            )}
          </Item>

          <Item name="total" label="Total ($)" className="font-bold">
            <InputNumber 
              className="w-full" 
              min={0}
              formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={v => v.replace(/\$\s?|(,*)/g, '')}
              readOnly
            />
          </Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReporteGanancias;