import React, { useState, useEffect, useRef } from "react";
import { DataTable, DataTablePageEvent, DataTableSelectionChangeEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputSwitch, InputSwitchChangeEvent } from "primereact/inputswitch";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { Button } from "primereact/button";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import "primeicons/primeicons.css";
import { ProgressSpinner } from "primereact/progressspinner";
import axios from "axios";

interface Product {
    id: string;
    title: string;
    place_of_origin: string;
    artist_display: string;
    date_start: number;
    date_end: number;
}

export default function CheckboxRowSelectionDemo() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]); // Track selected IDs across pages
    const [rowClick, setRowClick] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [totalRecords, setTotalRecords] = useState<number>(0); // Total records for paginator
    const [rowsPerPage, setRowsPerPage] = useState<number>(12); // Default rows per page
    const [currentPage, setCurrentPage] = useState<number>(1);

    const op = useRef<OverlayPanel>(null!);
    const [rowInputValue, setRowInputValue] = useState<string>("");

    // Fetch data from the API for the given page
    const fetchApiData = async (page: number) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
            const data = response.data.data;

            const mappedProducts = data.map((item: any) => ({
                id: item.id,
                title: item.title,
                place_of_origin: item.place_of_origin,
                artist_display: item.artist_display,
                date_start: item.date_start,
                date_end: item.date_end,
            }));

            setTotalRecords(response.data.pagination.total); // Set total records for pagination
            setProducts(mappedProducts); // Set fetched products
            setCurrentPage(page); // Set the current page
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch for the first page
    useEffect(() => {
        fetchApiData(1); // Load the first page on component mount
    }, []);

    // Handle page change in DataTable
    const handlePageChange = (event: DataTablePageEvent) => {
        const page = event.page + 1; // PrimeReact uses zero-based pages, so increment by 1
        setCurrentPage(page); // Set the current page in state
        fetchApiData(page); // Fetch data for the new page
    };

    // Handle row selection across pages (including unselect)
    const handleSelectionChange = (e: DataTableSelectionChangeEvent) => {
        const selectedRows = e.value.map((product: Product) => product.id); // Current selected rows
    
        setSelectedProductIds((prevSelected) => {
            // Check which items are newly selected and which are unselected
            const newlySelected = selectedRows.filter(id => !prevSelected.includes(id)); // New selections
            const unselected = prevSelected.filter(id => !selectedRows.includes(id)); // Unselected rows
    
            // Update the state: Add new selections, remove unselected items
            return [...prevSelected, ...newlySelected].filter(id => !unselected.includes(id));
        });
    };

    const handleRowUnselection = (e: DataTableSelectionChangeEvent) => {
        const deselectedRows = e.value.map((product: Product) => product.id); // Unselected rows
        setSelectedProductIds((prevSelected) => {
            return prevSelected.filter((id) => !deselectedRows.includes(id)); // Remove only unselected rows from the state
        });
    };

    const handleCustomRowSelection = async () => {
        const numToSelect = parseInt(rowInputValue, 10);
        if (isNaN(numToSelect) || numToSelect <= 0) {
            console.warn("Invalid number of rows to select");
            return;
        }

        let selectedRowCount = 0;
        let page = 1;
        let newSelectedProductIds: string[] = [];

        // Fetch and select rows until the required number is selected
        while (selectedRowCount < numToSelect) {
            try {
                const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}`);
                const data = response.data.data;

                const mappedProducts = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    place_of_origin: item.place_of_origin,
                    artist_display: item.artist_display,
                    date_start: item.date_start,
                    date_end: item.date_end,
                }));

                const remainingToSelect = numToSelect - selectedRowCount;
                const productsToSelect = mappedProducts.slice(0, remainingToSelect).map((product) => product.id);

                newSelectedProductIds = [...newSelectedProductIds, ...productsToSelect];
                selectedRowCount += productsToSelect.length;

                // Move to next page if more rows need to be selected
                page++;
                setRowInputValue("");
            } catch (error) {
                console.error("Error fetching data for selection:", error);
                break;
            }
        }

        // Update state to reflect selected rows across pages
        setSelectedProductIds((prevSelected) => {
            const finalSelection = [...prevSelected, ...newSelectedProductIds].filter(
                (value, index, self) => self.indexOf(value) === index // Ensure no duplicates
            );
            return finalSelection;
        });
    };

    return (
        <div className="card">
            <div className="flex justify-content-center align-items-center mb-4 gap-2">
                <InputSwitch
                    inputId="input-rowclick"
                    checked={rowClick}
                    onChange={(e: InputSwitchChangeEvent) => setRowClick(e.value!)}
                />
                <label htmlFor="input-rowclick">Row Click</label>
            </div>
            <Button
                text
                rounded
                type="button"
                icon="pi pi-chevron-down"
                onClick={(e) => op.current.toggle(e)}
            />
            <OverlayPanel ref={op}>
                <InputText
                    value={rowInputValue}
                    placeholder="Enter number"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRowInputValue(e.target.value)}
                />
                <Button label="Submit" onClick={handleCustomRowSelection} />
            </OverlayPanel>

            {loading ? (
                <div className="flex justify-content-center align-items-center" style={{ height: "200px" }}>
                    <ProgressSpinner style={{ width: "50px", height: "50px" }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                </div>
            ) : (
                <DataTable
    value={products}
    paginator
    rows={rowsPerPage}
    totalRecords={totalRecords}
    lazy
    first={(currentPage - 1) * rowsPerPage} // Set the starting point for pagination
    onPage={handlePageChange} // Handle page change event
    selection={products.filter((product) => selectedProductIds.includes(product.id))} // Filter selected products
    selectionMode={rowClick ? "single" : "multiple"} // Single or multiple selection based on InputSwitch
    onSelectionChange={handleSelectionChange} // Handle row selection change
    onUnselect={handleRowUnselection} // Handle row unselection
    dataKey="id"
    tableStyle={{ minWidth: "50rem" }}
>
    {!rowClick && (
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
    )}
    <Column field="title" header="Title"></Column>
    <Column field="place_of_origin" header="Place of Origin"></Column>
    <Column field="artist_display" header="Artist"></Column>
    <Column field="date_start" header="Date Start"></Column>
    <Column field="date_end" header="Date End"></Column>
</DataTable>


            )}
        </div>
    );
}
