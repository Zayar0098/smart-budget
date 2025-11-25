import { useState, useEffect } from "react";

type Category = any;

const safeParse = (key: string, defaultValue: any) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const useSharedAppState = () => {
    // 1. 全ての共有データに対する state と localStorage の初期化
    const [income, setIncomeState] = useState<number>(() => safeParse("sb_income", 0));
    const [limit, setLimitState] = useState<number>(() => safeParse("sb_limit", 0));
    const [balanceOverride, setBalanceOverrideState] = useState<number | null>(() => safeParse("sb_balance_override", null));
    const [categories, setCategoriesState] = useState<Category[]>(() => safeParse("sb_categories", []));

    // 2. データを更新し、localStorageに書き込むラッパー関数
    const setAndSync = (key: string, value: any, setState: React.Dispatch<React.SetStateAction<any>>) => {
        setState(value);
        if (value === null || value === undefined) {
            localStorage.removeItem(key);
        } else if (typeof value === 'number' || typeof value === 'string') {
            localStorage.setItem(key, String(value));
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    };
    
    // 公開用のセッター関数
    const setIncome = (value: number) => setAndSync("sb_income", value, setIncomeState);
    const setLimit = (value: number) => setAndSync("sb_limit", value, setLimitState);
    const setBalanceOverride = (value: number | null) => setAndSync("sb_balance_override", value, setBalanceOverrideState);
    const setCategories = (value: Category[] | ((prev: Category[]) => Category[])) => {
        // 関数形式のsetStateにも対応
        if (typeof value === 'function') {
            setCategoriesState(prev => {
                const newValue = value(prev);
                setAndSync("sb_categories", newValue, setCategoriesState);
                return newValue;
            });
        } else {
            setAndSync("sb_categories", value, setCategoriesState);
        }
    };

    // 3. Storage Event Listener による同期ロジック (他タブの変更を検知)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (!e.key) return;
            const newValue = e.newValue ? safeParse(e.key, null) : null;

            switch (e.key) {
                case "sb_income":
                    setIncomeState(newValue !== null ? Number(newValue) : 0);
                    break;
                case "sb_limit":
                    setLimitState(newValue !== null ? Number(newValue) : 0);
                    break;
                case "sb_balance_override":
                    setBalanceOverrideState(newValue);
                    break;
                case "sb_categories":
                    setCategoriesState(newValue || []);
                    break;
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    return { 
        income, 
        setIncome, 
        limit, 
        setLimit, 
        balanceOverride, 
        setBalanceOverride,
        categories,
        setCategories
    };
};

export default useSharedAppState;