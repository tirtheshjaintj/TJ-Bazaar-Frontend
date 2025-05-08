import { createContext, useState, ReactNode, useContext } from "react";
import { ProductsByCategory } from "../pages/Home";
type ProductContextType = {
    products: ProductsByCategory[];
    setProducts: React.Dispatch<React.SetStateAction<ProductsByCategory[]>>;
};

export const ProductContext = createContext<ProductContextType | null>(null);

type ProductProviderProps = {
    children: ReactNode;
};

// 5. Create the provider component
export function ProductContextProvider({ children }: ProductProviderProps) {
    const [products, setProducts] = useState<ProductsByCategory[]>([]);

    return (
        <ProductContext.Provider value={{ products, setProducts }}>
            {children}
        </ProductContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductContext() {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error("useProductContext must be used within a ProductContextProvider");
    }
    return context;
}
