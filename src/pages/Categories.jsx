import React, { useEffect, useState } from 'react';
import { Button, Input, Label, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from '@fluentui/react-components';
import { Save24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { api } from '../utils/api';
import '../styles/pages/Categories.css';

export default function Categories() {
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    const normItems = (data) => {
        if (Array.isArray(data)) return data;
        if (data?.items && Array.isArray(data.items)) return data.items;
        if (data?.content && Array.isArray(data.content)) return data.content;
        if (data?.results && Array.isArray(data.results)) return data.results;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
    };

    async function load() {
        try {
            setError('');
            const { data } = await api(`/ems/categories?page=${page}&size=${limit}`);
            setRows(normItems(data));
        } catch (e) {
            setRows([]);
            setError(e.message || 'Greška pri učitavanju kategorija.');
        }
    }
    useEffect(() => { load(); }, [page]);

    async function create() {
        if (!name.trim()) return;
        await api('/ems/categories', { method: 'POST', body: { categoryName: name.trim(), categoryDescription: desc.trim() } });
        setName(''); setDesc(''); await load();
    }

    async function update(c) {
        await api(`/ems/categories/${c.categoryID}`, { method: 'PUT', body: { categoryName: c.categoryName, categoryDescription: c.categoryDescription } });
        await load();
    }

    async function remove(id) {
        await api(`/ems/categories/${id}`, { method: 'DELETE' });
        await load();
    }

    return (
        <div className="w11-pageShell">
            <header className="w11-titleRow">
                <h2 className="w11-title">Categories</h2>
                {error && <div className="w11-error">{error}</div>}
            </header>

            <section className="w11-card">
                <div className="w11-grid2">
                    <div className="w11-field">
                        <Label required>Name</Label>
                        <Input value={name} onChange={(_, v) => setName(v.value)} />
                    </div>
                    <div className="w11-field">
                        <Label>Description</Label>
                        <Input value={desc} onChange={(_, v) => setDesc(v.value)} />
                    </div>
                </div>

                <div className="w11-actionBar">
                    <Button appearance="primary" icon={<Save24Regular />} className="w11-btn w11-btnPrimary" onClick={create}>
                        Add category
                    </Button>
                    <Button appearance="secondary" icon={<Dismiss24Regular />} className="w11-btn w11-btnSecondary" onClick={() => { setName(''); setDesc(''); }}>
                        Cancel
                    </Button>
                </div>
            </section>

            <section className="w11-card">
                <div className="w11-tableWrap">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderCell style={{ width: 120 }}>ID</TableHeaderCell>
                                <TableHeaderCell>Name</TableHeaderCell>
                                <TableHeaderCell>Description</TableHeaderCell>
                                <TableHeaderCell>Actions</TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((c) => (
                                <TableRow key={c.categoryID}>
                                    <TableCell>{c.categoryID}</TableCell>
                                    <TableCell>
                                        <Input value={c.categoryName} onChange={(_, v) => { c.categoryName = v.value; setRows([...rows]); }} />
                                    </TableCell>
                                    <TableCell>
                                        <Input value={c.categoryDescription} onChange={(_, v) => { c.categoryDescription = v.value; setRows([...rows]); }} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="w11-rowActions">
                                            <Button className="w11-btn w11-btnPrimary" onClick={() => update(c)}>Save</Button>
                                            <Button className="w11-btn w11-btnSecondary" onClick={() => remove(c.categoryID)}>Delete</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="w11-pager">
                    <Button className="w11-btn w11-btnSecondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button className="w11-btn w11-btnSecondary" disabled={rows.length < limit} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
            </section>
        </div>
    );
}
