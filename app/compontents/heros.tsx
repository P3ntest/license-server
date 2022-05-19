import { Card, Center } from '@mantine/core';
import React, { useEffect, useState } from 'react';

export function CardHero({ children }: { children: React.ReactNode }) {
    return (
        <Center mt={20}>
            <Card>{children}</Card>
        </Center>
    );
}

export function useOrigin() {
    const [origin, setOrigin] = useState<string>();
    useEffect(() => {
        setOrigin(window.location.origin);
    }, []);

    return origin;
}
