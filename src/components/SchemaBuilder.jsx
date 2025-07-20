import React, { useState, useCallback } from 'react';

// Field factory
let nextId = 1;
const makeField = () => ({ id: nextId++, keyName: '', type: 'string', children: [] });

export default function SchemaBuilder() {
  const [fields, setFields] = useState([ makeField() ]);
  const [viewJson, setViewJson] = useState(false);

  // --- UPDATE ---
  const updateField = useCallback((id, data) => {
    const recurse = arr => arr.map(f => {
      if (f.id === id) return { ...f, ...data };
      if (f.children.length) return { ...f, children: recurse(f.children) };
      return f;
    });
    setFields(prev => recurse(prev));
  }, []);

  // --- ADD ---
  const addField = useCallback((parentId = null) => {
    const newField = makeField();
    if (parentId === null) {
      setFields(prev => [...prev, newField]);
    } else {
      const recurse = arr => arr.map(f => {
        if (f.id === parentId) {
          // only append to a true Nested
          return { ...f, children: [...f.children, newField] };
        }
        if (f.children.length) {
          return { ...f, children: recurse(f.children) };
        }
        return f;
      });
      setFields(prev => recurse(prev));
    }
  }, []);

  // --- DELETE ---
  const deleteField = useCallback((id) => {
    const recurse = arr => arr
      .filter(f => f.id !== id)
      .map(f => ({ ...f, children: recurse(f.children) }));
    setFields(prev => recurse(prev));
  }, []);

  // --- BUILD JSON ---
  const buildSchema = useCallback(arr => {
    const obj = {};
    arr.forEach(f => {
      if (!f.keyName.trim()) return;         // skip empty keys
      if (f.type === 'nested') {
        obj[f.keyName] = {
          type: 'object',
          properties: buildSchema(f.children),
        };
      } else {
        obj[f.keyName] = { type: f.type };
      }
    });
    return obj;
  }, []);

  return (
    <div className="builder-container">
         
      <div className="controls">
        <button onClick={() => addField()} className="btn btn-primary">
          + Add Root Field
        </button>
        <button onClick={() => setViewJson(v => !v)} className="btn btn-secondary">
          {viewJson ? 'Edit Mode' : 'JSON Preview'}
        </button>
      </div>

      {viewJson
        ? <pre className="json-preview">{JSON.stringify(buildSchema(fields), null, 2)}</pre>
        : <FieldList
            fields={fields}
            updateField={updateField}
            addField={addField}
            deleteField={deleteField}
          />
      }
    </div>
  );
}

function FieldList({ fields, updateField, addField, deleteField }) {
  return (
    <div className="field-list">
      {fields.map(f => (
        <FieldRow
          key={f.id}
          field={f}
          updateField={updateField}
          addField={addField}
          deleteField={deleteField}
        />
      ))}
    </div>
  );
}

function FieldRow({ field, updateField, addField, deleteField }) {
  return (
    <div className="field-row">
      <input
        type="text"
        placeholder="Key"
        value={field.keyName}
        onChange={e => updateField(field.id, { keyName: e.target.value })}
      />

      <select
        value={field.type}
        onChange={e => updateField(field.id, { type: e.target.value, children: [] })}
      >
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="nested">Nested</option>
      </select>

      {/* show “add child” only on Nested rows */}
      {field.type === 'nested' && (
        <button className="btn btn-add" onClick={() => addField(field.id)}>+</button>
      )}

      <button className="btn btn-remove" onClick={() => deleteField(field.id)}>–</button>

      {/* recurse into children */}
      {field.children.length > 0 && (
        <FieldList
          fields={field.children}
          updateField={updateField}
          addField={addField}
          deleteField={deleteField}
        />
      )}
    </div>
  );
}
