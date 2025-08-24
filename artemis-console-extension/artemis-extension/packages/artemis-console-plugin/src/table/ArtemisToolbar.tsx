import React, { useState } from 'react';
import { Button, ToolbarItem, Select, SelectList, SelectOption, MenuToggleElement, MenuToggle, TextInput } from '@patternfly/react-core';
import { OptionsMenu, OptionsMenuItem, OptionsMenuItemGroup, OptionsMenuSeparator, OptionsMenuToggle } from '@patternfly/react-core/deprecated';
import { SortAmountDownIcon } from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon';
import { Column, SortDirection, ActiveSort, ToolbarAction } from './ArtemisTable';

export type ArtemisToolbarProps = {
  activeSort: ActiveSort;
  columns: Column[];
  initialFilter: { column: string; operation: string; input: string };
  isSortDropdownOpen: boolean;
  operationOptions: { id: string; name: string }[];
  toolbarActions?: ToolbarAction[];
  handleModalToggle: () => void;
  onApplyFilter: (filter: { column: string; operation: string; input: string }) => void;
  setIsSortDropdownOpen: (open: boolean) => void;
  updateActiveSort: (id: string, order: SortDirection) => void;
};

export const ArtemisToolbar: React.FC<ArtemisToolbarProps> = ({
  activeSort,
  columns,
  initialFilter,
  isSortDropdownOpen,
  operationOptions,
  toolbarActions,
  handleModalToggle,
  onApplyFilter,
  setIsSortDropdownOpen,
  updateActiveSort
}) => {
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

  const visibleColumns = columns.filter(c => c.visible);

  return (
    <>
      {/* Sort Menu */}
      <ToolbarItem key="sort-menu">
        <OptionsMenu
          id="sort-options-menu"
          menuItems={[
            <OptionsMenuItemGroup key="sort-columns" aria-label="Sort column">
              {visibleColumns.map(col => (
                <OptionsMenuItem
                  key={col.id}
                  isSelected={activeSort.id === col.id}
                  onSelect={() => updateActiveSort(col.id, activeSort.order)}
                >
                  {col.name}
                </OptionsMenuItem>
              ))}
            </OptionsMenuItemGroup>,
            <OptionsMenuSeparator key="sep" />,
            <OptionsMenuItemGroup key="sort-direction" aria-label="Sort direction">
              <OptionsMenuItem
                onSelect={() => updateActiveSort(activeSort.id, SortDirection.ASCENDING)}
                isSelected={activeSort.order === SortDirection.ASCENDING}
              >
                Ascending
              </OptionsMenuItem>
              <OptionsMenuItem
                onSelect={() => updateActiveSort(activeSort.id, SortDirection.DESCENDING)}
                isSelected={activeSort.order === SortDirection.DESCENDING}
              >
                Descending
              </OptionsMenuItem>
            </OptionsMenuItemGroup>
          ]}
          isOpen={isSortDropdownOpen}
          toggle={
            <OptionsMenuToggle
              hideCaret
              onToggle={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
              toggleTemplate={<SortAmountDownIcon />}
            />
          }
          isPlain
          isGrouped
        />
      </ToolbarItem>

      {/* Filter controls */}
      <ToolbarItem variant="search-filter">
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
            {visibleColumns.map(c => (
              <SelectOption key={c.id} value={c.name}>{c.name}</SelectOption>
            ))}
          </SelectList>
        </Select>
      </ToolbarItem>

      <ToolbarItem variant="search-filter">
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

      <ToolbarItem variant="search-filter">
        <TextInput
          aria-label="search-text"
          value={inputValue}
          onChange={(_event, value) => setInputValue(value)}
          onKeyDown={e => { if (e.key === 'Enter') applyFilter(); }}
        />
      </ToolbarItem>

      <ToolbarItem>
        <Button variant="primary" onClick={applyFilter}>Search</Button>
      </ToolbarItem>

      {/* Manage Columns and extra toolbar actions */}
      <ToolbarItem>
        <Button variant="link" onClick={handleModalToggle}>Manage Columns</Button>
      </ToolbarItem>
      {toolbarActions?.map(action => (
        <ToolbarItem key={action.name}>
          <Button variant="link" onClick={() => action.action()}>{action.name}</Button>
        </ToolbarItem>
      ))}
    </>
  );
};
