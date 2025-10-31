import { useEffect, useRef } from "react";
import { ContextMenuProps } from "src/utils/types";
import {
    Eye,
    Terminal,
    Brain,
    Trash2,
    RefreshCw,
    Server,
    Settings,
} from 'lucide-react';


export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, target, onClose, onAction }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const menuItems = {
        database: [
            { icon: Terminal, label: 'Open Query Console', action: 'open-console' },
            { icon: RefreshCw, label: 'Refresh', action: 'refresh' },
            { icon: Settings, label: 'Connection Settings', action: 'settings' },
            { icon: Server, label: 'Disconnect', action: 'disconnect' },
        ],
        table: [
            { icon: Eye, label: 'View Data', action: 'view-data' },
            { icon: Terminal, label: 'Open Query Console', action: 'open-console' },
            { icon: Brain, label: 'Ask AI about Table', action: 'ask-ai' },
            { icon: RefreshCw, label: 'Refresh', action: 'refresh' },
            { icon: Trash2, label: 'Delete Table', action: 'delete', danger: true },
        ],
        view: [
            { icon: Eye, label: 'View Data', action: 'view-data' },
            { icon: Terminal, label: 'Open Query Console', action: 'open-console' },
            { icon: RefreshCw, label: 'Refresh', action: 'refresh' },
        ],
        procedure: [
            { icon: Terminal, label: 'Execute Procedure', action: 'execute' },
            { icon: Eye, label: 'View Definition', action: 'view-definition' },
        ]
    } as const;

    const items = menuItems[target.type] || [];

    return (
        <div
            ref={menuRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[200px]"
            style={{ left: x, top: y }}
        >
            {items?.map((item, index) => {
                const Icon = item.icon;
                const isDanger = 'danger' in item && item.danger;
                return (
                    <button
                        key={index}
                        onClick={() => {
                            onAction(item.action, target);
                            onClose();
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${isDanger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
                            }`}
                    >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};