import React, { useEffect, useMemo, useState } from 'react';
import {
    Button, Input, Textarea, Label,
    Combobox, Option
} from '@fluentui/react-components';
import { Save24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import '../styles/pages/Events.css';

function getUserIdFromToken() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const [, p] = token.split('.');
        if (!p) return null;
        const b64 = p.replace(/-/g, '+').replace(/_/g, '/');
        const json = JSON.parse(atob(b64));
        const raw =
            json.user_id ??
            json.userID ??
            json.id ??
            (typeof json.sub === 'string' && /^\d+$/.test(json.sub) ? Number(json.sub) : null);
        const id = typeof raw === 'string' ? Number(raw) : raw;
        return Number.isFinite(id) ? id : null;
    } catch {
        return null;
    }
}

const normItems = (d) =>
    Array.isArray(d) ? d : (d?.items || d?.content || d?.results || d?.data || []);

export default function EventForm({ mode }) {
    const nav = useNavigate();
    const { eventID } = useParams();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startAt, setStartAt] = useState('');
    const [location, setLocation] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [tags, setTags] = useState('');
    const [maxCapacity, setMaxCapacity] = useState('');

    const [cats, setCats] = useState([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const [catInput, setCatInput] = useState('');
    const [catSelected, setCatSelected] = useState('');
    const [open, setOpen] = useState(false);

    const catOptions = useMemo(
        () => cats.map(c => ({
            id: String(c.categoryID ?? c.id),
            name: String(c.categoryName ?? c.name ?? '')
        })),
        [cats]
    );

    useEffect(() => {
        (async () => {
            try {
                setError('');
                const { data } = await api('/ems/categories?page=1&size=100');
                const list = normItems(data);
                setCats(list);
            } catch (e) {
                setError(e.message || 'Error loading categories.');
            }
        })();
    }, []);

    useEffect(() => {
        if (mode !== 'edit' || !eventID) return;
        (async () => {
            try {
                setError('');
                const { data } = await api(`/ems/events/${eventID}`);
                setTitle(data.eventName ?? data.title ?? '');
                setDescription(data.eventDescription ?? data.description ?? '');
                const t = data.startTime ?? data.startAt ?? '';
                setStartAt(t ? String(t).replace(' ', 'T').slice(0, 16) : '');
                setLocation(data.eventLocation ?? data.location ?? '');
                const cid = String(data.categoryID ?? data.categoryId ?? '');
                setCategoryId(cid);
                setCatSelected(cid);
                const tagNames = Array.isArray(data.tags)
                    ? data.tags.map((t) => t?.tagName ?? t?.name).filter(Boolean)
                    : [];
                setTags(tagNames.join(', '));
                setMaxCapacity(data.maxCapacity ?? '');
            } catch (e) {
                setError(e.message || 'Error loading event.');
            }
        })();
    }, [mode, eventID]);

    useEffect(() => {
        if (!catOptions.length) return;

        if (categoryId) {
            const match = catOptions.find(o => o.id === categoryId);
            if (match) {
                setCatSelected(match.id);
                setCatInput(match.name);
                return;
            }
        }

        if (mode === 'create' && catOptions.length) {
            const first = catOptions[0];
            setCategoryId(first.id);
            setCatSelected(first.id);
            setCatInput(first.name);
        }
    }, [catOptions, categoryId, mode]);

    function normalizeTags(input) {
        return input
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);
    }

    async function save() {
        try {
            setError('');
            if (!title.trim()) throw new Error('Title is required.');
            if (!categoryId) throw new Error('Category is required.');
            if (mode === 'create' && !startAt) throw new Error('Start time is required.');

            const base = {
                eventName: title.trim(),
                eventDescription: (description || '').trim(),
                eventLocation: (location || '').trim(),
                categoryID: Number(categoryId),
                tags: normalizeTags(tags),
                maxCapacity: maxCapacity === '' ? null : Number(maxCapacity),
            };

            let body;
            if (mode === 'create') {
                const authorID = getUserIdFromToken();
                if (!authorID) console.warn('AuthorID not found in token. Backend should extract it from JWT.');
                body = { ...base, startAt, authorID: authorID ?? 0 };
            } else {
                body = { ...base, ...(startAt ? { startAt } : {}) };
            }

            setSaving(true);
            if (mode === 'create') {
                await api('/ems/events', { method: 'POST', body });
            } else {
                await api(`/ems/events/${eventID}`, { method: 'PUT', body });
            }
            nav('/ems/events');
        } catch (e) {
            setError(e?.message || 'Error saving event.');
        } finally {
            setSaving(false);
        }
    }

    const onCatSelect = (_, data) => {
        const id = data?.optionValue ?? '';
        const text = data?.optionText ?? '';
        if (!id) return;
        setCatSelected(id);
        setCatInput(text);
        setCategoryId(id);
        setOpen(false);
    };

    return (
        <div className="w11-pageShell">
            <header className="w11-titleRow">
                <h2 className="w11-title">{mode === 'create' ? 'New event' : 'Edit event'}</h2>
                {error && <div className="w11-error">{error}</div>}
            </header>

            <form
                className="w11-card w11-form"
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!saving) save();
                }}
            >
                <div className="w11-grid2">
                    <div className="w11-field">
                        <Label required>Title</Label>
                        <Input value={title} onChange={(_, v) => setTitle(v.value)} />
                    </div>

                    <div className="w11-field">
                        <Label required>Category</Label>
                        <Combobox
                            className="w11-combobox"
                            placeholder="Izaberi kategoriju"
                            value={catInput}
                            selectedOptions={[catSelected]}
                            onOptionSelect={onCatSelect}
                            open={open}
                            onOpenChange={(_, d) => setOpen(!!d.open)}
                            expandIconPosition="end"
                        >
                            {catOptions.map(o => (
                                <Option key={o.id} value={o.id} text={o.name}>
                                    {o.name}
                                </Option>
                            ))}
                        </Combobox>
                    </div>
                </div>

                <div className="w11-field">
                    <Label>Description</Label>
                    <Textarea rows={5} value={description} onChange={(_, v) => setDescription(v.value)} />
                </div>

                <div className="w11-grid2">
                    <div className="w11-field">
                        <Label required={mode === 'create'}>Start time</Label>
                        <Input type="datetime-local" value={startAt} onChange={(_, v) => setStartAt(v.value)} />
                    </div>
                    <div className="w11-field">
                        <Label>Location</Label>
                        <Input value={location} onChange={(_, v) => setLocation(v.value)} />
                    </div>
                </div>

                <div className="w11-grid2">
                    <div className="w11-field">
                        <Label>Tags (with comma)</Label>
                        <Input value={tags} onChange={(_, v) => setTags(v.value)} placeholder="music, concert, live" />
                    </div>
                    <div className="w11-field">
                        <Label>Max capacity</Label>
                        <Input type="number" min={0} value={maxCapacity} onChange={(_, v) => setMaxCapacity(v.value)} />
                    </div>
                </div>

                <div className="w11-actionBar">
                    <Button
                        appearance="primary"
                        icon={<Save24Regular />}
                        type="submit"
                        className="w11-btn w11-btnPrimary"
                        disabled={saving}
                    >
                        {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                    <Button
                        appearance="secondary"
                        icon={<Dismiss24Regular />}
                        type="button"
                        className="w11-btn w11-btnSecondary"
                        onClick={() => history.back()}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
