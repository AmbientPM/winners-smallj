import { use } from "react";
import { Card } from "@/shared/components/ui/card";
import { METALS, MetalType } from "@/shared/types/api";
import Link from "next/link";
import { VoucherContent } from "./voucher-content";

export function generateStaticParams() {
    return Object.keys(METALS).map((metal) => ({
        metal,
    }));
}

export default function VoucherPage({ params }: { params: Promise<{ metal: string }> }) {
    const { metal } = use(params);

    // Validate metal type
    const metalType = metal as MetalType;
    if (!METALS[metalType]) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="p-6 text-center">
                    <h1 className="text-2xl font-bold mb-2">Invalid Metal Type</h1>
                    <p className="text-muted-foreground mb-4">Please select a valid metal type.</p>
                    <Link href="/" className="text-primary hover:underline">
                        Return to Home
                    </Link>
                </Card>
            </div>
        );
    }

    return <VoucherContent metalType={metalType} />;
}
