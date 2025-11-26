import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { wasteService, WASTE_CATEGORIES } from '../services/wasteService';
import { Save, AlertCircle, CheckCircle2, Loader2, Plus, Edit2, Trash2, Search } from 'lucide-react';

const DataEntry = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [records, setRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    // Form State
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [itemType, setItemType] = useState('');
    const [weight, setWeight] = useState('');

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const data = await wasteService.getAllRecords();
            setRecords(data);
        } catch (err) {
            console.error("Error fetching records:", err);
        } finally {
            setFetchLoading(false);
        }
    };

    // Reset dependent fields when parent changes
    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setSubCategory('');
        setItemType('');
    };

    const handleSubCategoryChange = (e) => {
        setSubCategory(e.target.value);
        setItemType('');
    };

    const handleOpenModal = (record = null) => {
        if (record) {
            setEditingRecord(record);
            setCategory(record.category);
            setSubCategory(record.subCategory);
            setItemType(record.itemType);
            setWeight(record.weight.toString());
        } else {
            setEditingRecord(null);
            setCategory('');
            setSubCategory('');
            setItemType('');
            setWeight('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        if (!category || !subCategory || !itemType || !weight) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        try {
            const recordData = {
                category,
                subCategory,
                itemType,
                weight: parseFloat(weight)
            };

            if (editingRecord) {
                // Update existing record
                await wasteService.updateRecord(editingRecord.id, recordData);
            } else {
                // Add new record
                await wasteService.addRecord(recordData, currentUser.uid);
            }

            setSuccess(true);
            handleCloseModal();
            fetchRecords(); // Refresh list

            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to save record. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (recordId) => {
        if (window.confirm('Are you sure you want to delete this record?')) {
            try {
                await wasteService.deleteRecord(recordId);
                setRecords(records.filter(r => r.id !== recordId));
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } catch (err) {
                setError('Failed to delete record.');
                console.error(err);
            }
        }
    };

    const currentCategory = WASTE_CATEGORIES[category];
    const currentSubCategory = currentCategory?.subCategories[subCategory];

    const filteredRecords = records.filter(record =>
        record.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.subCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.itemType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Waste Records Management</h2>
                    <p className="text-gray-500">จัดการข้อมูลการบันทึกขยะ</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        <span>Add Record</span>
                    </button>
                </div>
            </div>

            {/* Success/Error Messages */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r flex items-center">
                    <AlertCircle className="text-red-500 mr-2" size={20} />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r flex items-center">
                    <CheckCircle2 className="text-green-500 mr-2" size={20} />
                    <p className="text-green-700">Operation completed successfully!</p>
                </div>
            )}

            {/* Records Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {fetchLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        <Loader2 className="animate-spin inline-block" size={24} />
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No records found</td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.date?.seconds
                                                ? new Date(record.date.seconds * 1000).toLocaleDateString('th-TH')
                                                : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.subCategory}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.itemType}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.weight}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(record)}
                                                    className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full transition-colors"
                                                    title="Edit Record"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(record.id)}
                                                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
                        </div>

                        {/* Modal panel */}
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <Save className="h-6 w-6 text-primary-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                {editingRecord ? 'Edit Waste Record' : 'Add New Waste Record'}
                                            </h3>
                                            <div className="mt-4 space-y-4">
                                                {/* Category Selection */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Category (ประเภทขยะ)
                                                    </label>
                                                    <select
                                                        value={category}
                                                        onChange={handleCategoryChange}
                                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5"
                                                        required
                                                    >
                                                        <option value="">Select Category</option>
                                                        {Object.entries(WASTE_CATEGORIES).map(([key, value]) => (
                                                            <option key={key} value={key}>{value.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Sub-Category Selection */}
                                                {category && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Sub-Category (ประเภทย่อย)
                                                        </label>
                                                        <select
                                                            value={subCategory}
                                                            onChange={handleSubCategoryChange}
                                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5"
                                                            required
                                                        >
                                                            <option value="">Select Sub-Category</option>
                                                            {Object.entries(currentCategory.subCategories).map(([key, value]) => (
                                                                <option key={key} value={key}>{value.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Item Type Selection */}
                                                {subCategory && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Item Type (ชนิด)
                                                        </label>
                                                        <select
                                                            value={itemType}
                                                            onChange={(e) => setItemType(e.target.value)}
                                                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5"
                                                            required
                                                        >
                                                            <option value="">Select Item Type</option>
                                                            {currentSubCategory.items.map((item) => (
                                                                <option key={item} value={item}>{item}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {/* Weight Input */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Weight (kg) (น้ำหนัก)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={weight}
                                                        onChange={(e) => setWeight(e.target.value)}
                                                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin mr-2" size={16} />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save'
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataEntry;
