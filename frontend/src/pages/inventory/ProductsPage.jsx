import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, ArrowLeftRight, Eye, AlertTriangle, Package } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/formatters';
import { AddProductModal } from './AddProductModal';
import { ProductDetailModal } from './ProductDetailModal';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [warehouse, setWarehouse] = useState('All');
  const [status, setStatus] = useState('All');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { addToast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [prodRes, whRes] = await Promise.all([
        axiosClient.get('/products', {
          params: { search, category, warehouse, status }
        }),
        axiosClient.get('/warehouses')
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (whRes.success) setWarehouses(whRes.warehouses || []);
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to load products', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, warehouse, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const columns = [
    {
      header: 'SKU',
      accessor: 'sku',
      className: 'w-28 font-mono font-bold text-slate-800'
    },
    {
      header: 'Product Name',
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900">{p.name}</div>
          <div className="text-[11px] text-slate-500 line-clamp-1">{p.description}</div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'category',
      className: 'w-32'
    },
    {
      header: 'Total Stock',
      render: (p) => (
        <div>
          <span className="font-extrabold text-slate-900">{p.totalStock}</span>{' '}
          <span className="text-slate-400 text-xs">{p.unit || 'pcs'}</span>
          {p.reservedStock > 0 && (
            <div className="text-[10px] text-amber-600 font-medium">({p.reservedStock} reserved)</div>
          )}
        </div>
      )
    },
    {
      header: 'Price',
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900">{formatCurrency(p.sellingPrice)}</div>
          <div className="text-[10px] text-slate-400">Cost: {formatCurrency(p.purchasePrice)}</div>
        </div>
      )
    },
    {
      header: 'Status',
      render: (p) => <Badge variant={p.status}>{p.status}</Badge>
    },
    {
      header: 'Action',
      align: 'right',
      render: (p) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedProduct(p);
          }}
        >
          Details
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Inventory</span>
            <span>/</span>
            <span className="text-blue-600">Products</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Product Catalog & Multi-Warehouse Stock
          </h1>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setIsAddOpen(true)}
        >
          Add Product
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            placeholder="Search SKU or product title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: 'All', label: 'All Categories' },
              { value: 'Electronics', label: 'Electronics' },
              { value: 'Peripherals', label: 'Peripherals' },
              { value: 'Networking', label: 'Networking' },
              { value: 'Industrial', label: 'Industrial' }
            ]}
            className="w-40"
          />

          <Select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            options={[
              { value: 'All', label: 'All Warehouses' },
              ...warehouses.map(w => ({ value: w._id, label: w.name }))
            ]}
            className="w-48"
          />

          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Available', label: 'Available' },
              { value: 'Low Stock', label: 'Low Stock' },
              { value: 'Out Stock', label: 'Out of Stock' }
            ]}
            className="w-36"
          />
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <LoadingSpinner text="Loading products..." />
      ) : (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
          <Table
            columns={columns}
            data={products}
            onRowClick={(p) => setSelectedProduct(p)}
            emptyMessage="No products match the selected criteria."
          />
        </div>
      )}

      {/* Add Product Modal */}
      {isAddOpen && (
        <AddProductModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            setIsAddOpen(false);
            fetchProducts();
          }}
          warehouses={warehouses}
        />
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          onRefresh={fetchProducts}
        />
      )}
    </div>
  );
};
