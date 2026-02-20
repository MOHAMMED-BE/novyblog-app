import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales, type Locale } from './routing';

function isLocale(value: string): value is Locale {
    return (locales as readonly string[]).includes(value);
}

export default getRequestConfig(async ({ locale }) => {
    const resolvedLocale: Locale = locale && isLocale(locale) ? locale : defaultLocale;

    return {
        locale: resolvedLocale,
        messages: (await import(`../messages/${resolvedLocale}.json`)).default
    };
});
