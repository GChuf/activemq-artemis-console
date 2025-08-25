import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  DataList,
  DataListCheck,
  DataListItem,
  DataListItemRow,
  DataListCell,
  DataListItemCells,
  Toolbar,
  ToolbarContent,
  Modal,
  Pagination,
  PaginationVariant,
  Text,
  TextContent
} from '@patternfly/react-core';
import { Thead, Tr, Th, Tbody, Td, IAction, ActionsColumn, Table, InnerScrollContainer } from '@patternfly/react-table';
import { artemisPreferencesService } from '../artemis-preferences-service';


import { ArtemisToolbar } from './ArtemisToolbar';

export type Column = {
  id: string;
  name: string;
  visible: boolean;
  sortable: boolean;
  filterable: boolean;
  filter?: Function;
  filterTab?: number;
  link?: Function;
};

export enum SortDirection {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

export type ActiveSort = {
  id: string;
  order: SortDirection;
};

export type Filter = {
  column: string;
  operation: string;
  input: string;
};

export type ToolbarAction = {
  name: string;
  action: Function;
};

export type TableData = {
  allColumns: Column[];
  getData: Function;
  getRowActions?: Function;
  toolbarActions?: ToolbarAction[];
  loadData?: number;
  storageColumnLocation?: string;
  navigate?: Function;
  filter?: Filter;
};

export const ArtemisTable: React.FunctionComponent<TableData> = broker => {
  console.log("table?");
  
  const operationOptions = [
    { id: 'CONTAINS', name: 'Contains' },
    { id: 'NOT_CONTAINS', name: 'Does Not Contain' },
    { id: 'EQUALS', name: 'Equals' },
    { id: 'GREATER_THAN', name: 'Greater Than' },
    { id: 'LESS_THAN', name: 'Less Than' }
  ];

  const initialActiveSort = () => {
    if (broker.storageColumnLocation && sessionStorage.getItem(broker.storageColumnLocation + '.activesort')) {
      return JSON.parse(sessionStorage.getItem(broker.storageColumnLocation + '.activesort') as string);
    }
    return {
      id: broker.allColumns[0].id,
      order: SortDirection.ASCENDING
    };
  };

  const [rows, setRows] = useState([]);
  const [resultsSize, setResultsSize] = useState(0);
  const [columnsLoaded, setColumnsLoaded] = useState(false);

  const [columns, setColumns] = useState(broker.allColumns);
  const [activeSort, setActiveSort] = useState(initialActiveSort);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const initialFilter = () => {
    if (broker.storageColumnLocation && sessionStorage.getItem(broker.storageColumnLocation + '.filter')) {
      return JSON.parse(sessionStorage.getItem(broker.storageColumnLocation + '.filter') as string);
    }
    return {
      column: columns[1].id,
      operation: operationOptions[0].id,
      input: ''
    };
  };

  const [filter, setFilter] = useState(() => broker.filter ?? initialFilter());

  const listData = async () => {
    console.log("listing");
    const data = await broker.getData(page, perPage, activeSort, filter);
    setRows(data.data);
    setResultsSize(data.count);
  };

  useEffect(() => {
    if (!columnsLoaded && broker.storageColumnLocation) {
      const updatedColumns: Column[] = artemisPreferencesService.loadColumnPreferences(broker.storageColumnLocation, broker.allColumns);
      setColumns(updatedColumns);
      setColumnsLoaded(true);
    }
  }, [columnsLoaded]);

  //useEffect(() => {
  //  listData();
  //}, [activeSort]);

  const handleModalToggle = () => setIsModalOpen(!isModalOpen);
  const onSave = () => {
    setIsModalOpen(!isModalOpen);
    if (broker.storageColumnLocation) artemisPreferencesService.saveColumnPreferences(broker.storageColumnLocation, columns);
  };

  const selectAllColumns = () => setColumns(columns.map(col => ({ ...col, visible: true })));
  const unselectAllColumns = () => setColumns(columns.map(col => ({ ...col, visible: false })));
  const updateColumnStatus = (index: number, column: Column) => {
    const updatedColumns = [...columns];
    updatedColumns[index].visible = !columns[index].visible;
    setColumns(updatedColumns);
  };
  const updateActiveSort = (id: string, order: SortDirection) => {
    const updatedActiveSort: ActiveSort = { id, order };
    setActiveSort(updatedActiveSort);
    listData();
    sessionStorage.setItem(broker.storageColumnLocation + ".activesort", JSON.stringify(updatedActiveSort));
  };

  const getRowActions = (row: never, rowIndex: number): IAction[] => broker.getRowActions?.(row, rowIndex) ?? [];
  const handleSetPage = (_: any, newPage: number) => setPage(newPage);
  const handlePerPageSelect = (_: any, newPerPage: number) => {
    if (broker.storageColumnLocation) artemisPreferencesService.saveTablePageSize(broker.storageColumnLocation, newPerPage);
    setPage(1);
    setPerPage(newPerPage);
    listData();
  };
  const getKeyByValue = (row: never, columnName: string) => row[columnName];

  const renderPagination = (variant?: PaginationVariant) => (
    <Pagination
      itemCount={resultsSize}
      page={page}
      perPage={perPage}
      onSetPage={handleSetPage}
      onPerPageSelect={handlePerPageSelect}
      variant={variant}
      titles={{ paginationAriaLabel: `${variant} pagination` }}
    />
  );

  const renderModal = () => (
    <Modal
      title="Manage columns"
      isOpen={isModalOpen}
      variant="small"
      description={
        <TextContent>
          <Text>Selected categories are displayed in the table.</Text>
          <Button isInline onClick={selectAllColumns} variant="link">Select all</Button>{' | '}
          <Button isInline onClick={unselectAllColumns} variant="link">Unselect all</Button>
        </TextContent>
      }
      onClose={handleModalToggle}
      actions={[
        <Button key="save" variant="primary" onClick={onSave}>Save</Button>,
        <Button key="close" variant="secondary" onClick={handleModalToggle}>Cancel</Button>
      ]}
    >
      <DataList aria-label="Table column management" id="table-column-management" isCompact>
        {columns.map((column, id) => (
          <DataListItem key={column.id}>
            <DataListItemRow>
                <DataListCheck
                  aria-labelledby={`table-column-management-item-${column.id}`}
                  checked={column.visible}
                  name={`check-${column.id}`}
                  id={`check-${column.id}`}
                  onChange={checked => updateColumnStatus(id, column)}
                />
              <DataListItemCells
                dataListCells={[<DataListCell key={column.id}><label htmlFor={`check-${column.id}`}>{column.name}</label></DataListCell>]}
              />
            </DataListItemRow>
          </DataListItem>
        ))}
      </DataList>
    </Modal>
  );

  return (
    <>
      <Toolbar id="toolbar">
        <ToolbarContent>
          <ArtemisToolbar
            columns={columns}
            operationOptions={operationOptions}
            initialFilter={filter}
            onApplyFilter={f => { setPage(1); setFilter(f); listData(); }}
            activeSort={activeSort}
            updateActiveSort={updateActiveSort}
            isSortDropdownOpen={isSortDropdownOpen}
            setIsSortDropdownOpen={setIsSortDropdownOpen}
            handleModalToggle={handleModalToggle}
            toolbarActions={broker.toolbarActions}
          />
        </ToolbarContent>
      </Toolbar>
      <InnerScrollContainer>
        <Table variant="compact" aria-label="Data Table">
          <Thead>
            <Tr>
              {columns.map((col, idx) => {
                if (!col.visible) return null;
                const isSorted = col.id === activeSort.id;
                const direction = isSorted ? activeSort.order : undefined;
                const nextDirection = isSorted && activeSort.order === SortDirection.ASCENDING ? SortDirection.DESCENDING : SortDirection.ASCENDING;
                return (
                  <Th
                    key={col.id}
                    sort={{
                      sortBy: { index: idx, direction: direction === SortDirection.ASCENDING ? 'asc' : 'desc' },
                      onSort: () => updateActiveSort(col.id, nextDirection),
                      columnIndex: idx
                    }}
                  >
                    {col.name}
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {columns.filter(col => col.visible).map((col, idx) => {
                  const value = getKeyByValue(row, col.id);
                  if (col.filter) {
                    const filtered = col.filter(row);
                    return <Td key={idx}><Link to="" onClick={() => broker.navigate?.(col.filterTab, filtered)}>{value}</Link></Td>;
                  } else if (col.link) {
                    return <Td key={idx}><Link to="" onClick={() => col.link?.(row)}>{value}</Link></Td>;
                  } else {
                    return <Td key={idx}>{value}</Td>;
                  }
                })}
                <Td isActionCell>
                  <ActionsColumn items={getRowActions(row, rowIndex)} popperProps={{ position: 'right', appendTo: () => document.getElementById('root') as HTMLElement }} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </InnerScrollContainer>
      {renderPagination(PaginationVariant.bottom)}
      {renderModal()}
    </>
  );
};
