import React, { useState } from 'react';
import { Button, Select, SelectList, SelectOption, MenuToggleElement, MenuToggle, TextInput, ToolbarItem } from '@patternfly/react-core';

export type TableFilterProps = {
  columns: { id: string; name: string; visible: boolean }[];
  operationOptions: { id: string; name: string }[];
  initialFilter: { column: string; operation: string; input: string };
  onApplyFilter: (filter: { column: string; operation: string; input: string }) => void;
};

export const TableFilter: React.FC<TableFilterProps> = ({ columns, operationOptions, initialFilter, onApplyFilter }) => {
  const [filterColumn, setFilterColumn] = useState(
    columns.find(c => c.id === initialFilter.column)?.name
  );
  const [filterOperation, setFilterOperation] = useState(
    operationOptions.find(o => o.id === initialFilter.operation)?.name
  );
  const [inputValue, setInputValue] = useState(initialFilter.input);
  const [columnOpen, setColumnOpen] = useState(false);
  const [operationOpen, setOperationOpen] = useState(false);

  const applyFilter = () => {
    const column = columns.find(c => c.name === filterColumn);
    const operation = operationOptions.find(o => o.name === filterOperation);
    if (operation && column) {
      onApplyFilter({ column: column.id, operation: operation.id, input: inputValue });
    }
  };

  return (
    <>
      <ToolbarItem variant="search-filter" key='column-id-select'>
        <Select
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle ref={toggleRef} onClick={() => setColumnOpen(prev => !prev)} isFullWidth>
              {filterColumn}
            </MenuToggle>
          )}
          isOpen={columnOpen}
          onOpenChange={setColumnOpen}
          onSelect={(_e, selection) => { setFilterColumn(selection as string); setColumnOpen(false); }}
          selected={filterColumn}
        >
          <SelectList>
            {columns.filter(c => c.visible).map(c => (
              <SelectOption key={c.id} value={c.name}>{c.name}</SelectOption>
            ))}
          </SelectList>
        </Select>
      </ToolbarItem>

      <ToolbarItem variant="search-filter" key="filter-type">
        <Select
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle ref={toggleRef} onClick={() => setOperationOpen(prev => !prev)} isFullWidth>
              {filterOperation}
            </MenuToggle>
          )}
          isOpen={operationOpen}
          onOpenChange={setOperationOpen}
          onSelect={(_e, selection) => { setFilterOperation(selection as string); setOperationOpen(false); }}
          selected={filterOperation}
        >
          <SelectList>
            {operationOptions.map(o => (
              <SelectOption key={o.id} value={o.name}>{o.name}</SelectOption>
            ))}
          </SelectList>
        </Select>
      </ToolbarItem>

      <ToolbarItem variant="search-filter" key="search=text">
        <TextInput
          aria-label="search-text"
          value={inputValue}
          onChange={(_event, value) => setInputValue(value)}
          onKeyDown={e => { if (e.key === 'Enter') applyFilter(); }}
        />
      </ToolbarItem>

      <Button onClick={applyFilter}>Search</Button>
    </>
  );
};
