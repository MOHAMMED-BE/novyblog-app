'use client';

import * as React from 'react';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';

export type LinkBehaviorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> &
    NextLinkProps & { href: NextLinkProps['href'] };

export const LinkBehavior = React.forwardRef<HTMLAnchorElement, LinkBehaviorProps>(
    function LinkBehavior(props, ref) {
        const { href, ...other } = props;
        return <NextLink ref={ref} href={href} {...other} />;
    }
);
