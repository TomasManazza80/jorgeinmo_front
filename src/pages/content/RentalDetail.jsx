
import React, { useState, useEffect } from 'react';
import { Table, Button, Spin, message, DatePicker, Select, Modal, Form, InputNumber, Input } from 'antd';
import { PrinterOutlined, PlusOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Item } = Form;

const ReporteGanancias = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha: [moment().startOf('month'), moment().endOf('month')],
    departamento: null
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const [editingField, setEditingField] = useState('');
  const [formEdit] = Form.useForm();

  // Columnas de la tabla
  const columns = [
    {
      title: 'Departamento',
      dataIndex: 'departamento',
      key: 'departamento',
      fixed: 'left',
      className: 'font-medium',
      onCell: (record) => ({
        record,
        dataIndex: 'departamento',
        title: 'Departamento',
        editing: isEditing(record, 'departamento'),
        handleDoubleClick: handleDoubleClick,
        handleSave: handleSave
      }),
      render: (text, record) => {
        if (isEditing(record, 'departamento')) {
          return (
            <Item name="departamento" style={{ margin: 0 }}>
              <Input autoFocus onPressEnter={() => handleSave(record.key)} />
            </Item>
          );
        }
        return text;
      }
    },
    {
      title: 'Alquiler',
      dataIndex: 'alquiler',
      key: 'alquiler',
      className: 'text-right',
      onCell: (record) => ({
        record,
        dataIndex: 'alquiler',
        title: 'Alquiler',
        editing: isEditing(record, 'alquiler'),
        handleDoubleClick: handleDoubleClick,
        handleSave: handleSave
      }),
      render: (text, record) => {
        if (isEditing(record, 'alquiler')) {
          return (
            <Item name="alquiler" style={{ margin: 0 }}>
              <InputNumber 
                autoFocus
                min={0}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                className="w-full"
                onPressEnter={() => handleSave(record.key)}
              />
            </Item>
          );
        }
        return `$${text.toLocaleString()}`;
      }
    },
    {
      title: 'Servicios Básicos',
      dataIndex: 'servicios',
      key: 'servicios',
      className: 'text-right',
      onCell: (record) => ({
        record,
        dataIndex: 'servicios',
        title: 'Servicios Básicos',
        editing: isEditing(record, 'servicios'),
        handleDoubleClick: handleDoubleClick,
        handleSave: handleSave
      }),
      render: (text, record) => {
        if (isEditing(record, 'servicios')) {
          return (
            <Item name="servicios" style={{ margin: 0 }}>
              <InputNumber 
                autoFocus
                min={0}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                className="w-full"
                onPressEnter={() => handleSave(record.key)}
              />
            </Item>
          );
        }
        return `$${text.toLocaleString()}`;
      }
    },
    {
      title: 'Mantenimiento',
      dataIndex: 'mantenimiento',
      key: 'mantenimiento',
      className: 'text-right',
      onCell: (record) => ({
        record,
        dataIndex: 'mantenimiento',
        title: 'Mantenimiento',
        editing: isEditing(record, 'mantenimiento'),
        handleDoubleClick: handleDoubleClick,
        handleSave: handleSave
      }),
      render: (text, record) => {
        if (isEditing(record, 'mantenimiento')) {
          return (
            <Item name="mantenimiento" style={{ margin: 0 }}>
              <InputNumber 
                autoFocus
                min={0}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                className="w-full"
                onPressEnter={() => handleSave(record.key)}
              />
            </Item>
          );
        }
        return `$${text.toLocaleString()}`;
      }
    },
    {
      title: 'Otros Conceptos',
      dataIndex: 'otros',
      key: 'otros',
      className: 'text-right',
      onCell: (record) => ({
        record,
        dataIndex: 'otros',
        title: 'Otros Conceptos',
        editing: isEditing(record, 'otros'),
        handleDoubleClick: handleDoubleClick,
        handleSave: handleSave
      }),
      render: (text, record) => {
        if (isEditing(record, 'otros')) {
          return (
            <Item name="otros" style={{ margin: 0 }}>
              <InputNumber 
                autoFocus
                min={0}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                className="w-full"
                onPressEnter={() => handleSave(record.key)}
              />
            </Item>
          );
        }
        return `$${text.toLocaleString()}`;
      }
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      className: 'text-right',
      render: (text, record) => {
        if (editingKey === record.key) {
          const values = formEdit.getFieldsValue();
          return <span className="font-bold">${calcularTotal(values).toLocaleString()}</span>;
        }
        return <span className="font-bold">${text.toLocaleString()}</span>;
      }
    }
  ];

  const isEditing = (record, dataIndex) => {
    return record.key === editingKey && editingField === dataIndex;
  };

  const handleDoubleClick = (record, dataIndex) => {
    if (record.key === 'total') return; // No permitir editar la fila de totales
    
    formEdit.setFieldsValue({
      [dataIndex]: record[dataIndex]
    });
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
          total: calcularTotal({ ...item, [editingField]: values[editingField] })
        };
        
        newData.splice(index, 1, updatedItem);
        setData(actualizarTotales(newData));
        setEditingKey('');
        setEditingField('');
        message.success('Cambios guardados correctamente');
      }
    }).catch(error => {
      console.error('Error al validar:', error);
    });
  };

  // Simular carga de departamentos
  useEffect(() => {
    cargarDepartamentos();
  }, []);

  const cargarDepartamentos = async () => {
    try {
      const mockDepartamentos = [
        { id: 1, nombre: 'Departamento 101' },
        { id: 2, nombre: 'Departamento 102' },
        { id: 3, nombre: 'Departamento 201' },
        { id: 4, nombre: 'Departamento 202' },
        { id: 5, nombre: 'Todos', default: true }
      ];
      setDepartamentos(mockDepartamentos);
    } catch (error) {
      message.error('Error al cargar departamentos');
    }
  };

  const calcularTotal = (record) => {
    return (record.alquiler || 0) + 
           (record.servicios || 0) + 
           (record.mantenimiento || 0) + 
           (record.otros || 0);
  };

  const agregarRegistroManual = () => {
    form.validateFields().then(values => {
      const nuevoRegistro = {
        key: Date.now().toString(),
        departamento: values.departamento,
        alquiler: values.alquiler,
        servicios: values.servicios,
        mantenimiento: values.mantenimiento,
        otros: values.otros,
        total: calcularTotal(values)
      };

      setData(prevData => {
        const newData = [...prevData, nuevoRegistro];
        return actualizarTotales(newData);
      });

      form.resetFields();
      setModalVisible(false);
      message.success('Registro agregado correctamente');
    }).catch(error => {
      console.error('Error al validar:', error);
    });
  };

  const actualizarTotales = (data) => {
    const dataSinTotal = data.filter(item => item.key !== 'total');
    
    if (dataSinTotal.length > 0) {
      const totales = {
        key: 'total',
        departamento: 'TOTAL',
        alquiler: dataSinTotal.reduce((sum, item) => sum + (item.alquiler || 0), 0),
        servicios: dataSinTotal.reduce((sum, item) => sum + (item.servicios || 0), 0),
        mantenimiento: dataSinTotal.reduce((sum, item) => sum + (item.mantenimiento || 0), 0),
        otros: dataSinTotal.reduce((sum, item) => sum + (item.otros || 0), 0),
        total: dataSinTotal.reduce((sum, item) => sum + (item.total || calcularTotal(item)), 0)
      };
      return [...dataSinTotal, totales];
    }
    return dataSinTotal;
  };

  const handleFiltroChange = (name, value) => {
    setFiltros({
      ...filtros,
      [name]: value
    });
  };

  const handleImprimir = () => {
    const printWindow = window.open('', '_blank');
    const tableHtml = document.getElementById('reporte-table').outerHTML;
    const style = `
      <style>
        body { font-family: Arial; margin: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total-row { font-weight: bold; background-color: #f9f9f9; }
        .no-print { display: none; }
      </style>
    `;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Ganancias</title>
          ${style}
        </head>
        <body>
          <h1>Reporte de Ganancias</h1>
          <p>Período: ${filtros.fecha[0].format('DD/MM/YYYY')} - ${filtros.fecha[1].format('DD/MM/YYYY')}</p>
          ${tableHtml}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Componente personalizado para celdas editables
  const EditableCell = ({
    children,
    dataIndex,
    record,
    handleDoubleClick,
    editing,
    ...restProps
  }) => {
    return (
      <td 
        {...restProps}
        onDoubleClick={() => handleDoubleClick(record, dataIndex)}
        className={editing ? 'bg-blue-50' : ''}
      >
        {children}
      </td>
    );
  };

  const components = {
    body: {
      cell: EditableCell,
    },
  };

  return (
    <div className="p-5 bg-white rounded-lg shadow-md">
      <div className="mb-5 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800">Reporte de Ganancias</h2>
        
        <div className="mt-4 flex items-center space-x-4 no-print">
          <RangePicker
            value={filtros.fecha}
            onChange={(dates) => handleFiltroChange('fecha', dates)}
            format="DD/MM/YYYY"
            className="mr-4"
          />
          
          <Select
            placeholder="Seleccionar departamento"
            style={{ width: 200 }}
            value={filtros.departamento}
            onChange={(value) => handleFiltroChange('departamento', value)}
            allowClear
            className="mr-4"
          >
            {departamentos.map(depto => (
              <Option key={depto.id} value={depto.nombre}>
                {depto.nombre}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      
      <div className="mb-4 flex justify-between no-print">
        <Button 
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={editingKey !== ''}
        >
          Agregar Registro Manual
        </Button>
        
        <Button 
          type="primary"
          icon={<PrinterOutlined />}
          onClick={handleImprimir}
          disabled={loading || data.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          Imprimir Reporte
        </Button>
      </div>
      
      <Spin spinning={loading}>
        <Form form={formEdit} component={false}>
          <div id="reporte-table">
            <Table
              components={components}
              columns={columns}
              dataSource={data}
              pagination={false}
              scroll={{ x: true }}
              rowClassName={(record) => record.key === 'total' ? 'bg-gray-100 font-bold' : ''}
              className="w-full"
            />
          </div>
        </Form>
      </Spin>
      
      {/* Modal para agregar registro manual */}
      <Modal
        title={<span className="text-lg font-semibold">Agregar Registro Manual</span>}
        visible={modalVisible}
        onOk={agregarRegistroManual}
        onCancel={() => {
          form.resetFields();
          setModalVisible(false);
        }}
        okText="Agregar"
        cancelText="Cancelar"
        okButtonProps={{ className: 'bg-blue-600 hover:bg-blue-700' }}
        bodyStyle={{ padding: '24px' }}
      >
        <Form form={form} layout="vertical" className="space-y-4">
          <Item
            name="departamento"
            label={<span className="font-medium">Departamento</span>}
            rules={[{ required: true, message: 'Seleccione un departamento' }]}
          >
            <Select 
              placeholder="Seleccione un departamento"
              className="w-full"
            >
              {departamentos
                .filter(depto => depto.nombre !== 'Todos')
                .map(depto => (
                  <Option key={depto.id} value={depto.nombre}>
                    {depto.nombre}
                  </Option>
                ))}
            </Select>
          </Item>
          
          <Item
            name="alquiler"
            label={<span className="font-medium">Alquiler ($)</span>}
            rules={[{ required: true, message: 'Ingrese el monto del alquiler' }]}
          >
            <InputNumber 
              className="w-full"
              min={0} 
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Item>
          
          <Item
            name="servicios"
            label={<span className="font-medium">Servicios Básicos ($)</span>}
            rules={[{ required: true, message: 'Ingrese el monto de servicios' }]}
          >
            <InputNumber 
              className="w-full"
              min={0} 
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Item>
          
          <Item
            name="mantenimiento"
            label={<span className="font-medium">Mantenimiento ($)</span>}
            rules={[{ required: true, message: 'Ingrese el monto de mantenimiento' }]}
          >
            <InputNumber 
              className="w-full"
              min={0} 
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Item>
          
          <Item
            name="otros"
            label={<span className="font-medium">Otros Conceptos ($)</span>}
            initialValue={0}
          >
            <InputNumber 
              className="w-full"
              min={0} 
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReporteGanancias;