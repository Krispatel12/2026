import { TrendingUp } from "lucide-react";

export default function OrgUpdates() {
    return (
        <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Organization Updates</h1>
                    <p className="text-muted-foreground">Stay informed about the latest changes and announcements.</p>
                </div>
            </div>
            <div className="p-12 border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground">
                Updates Module Coming Soon
            </div>
        </div>
    );
}
