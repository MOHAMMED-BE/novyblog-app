export default function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 w-full border-t bg-white/90 backdrop-blur">
            <div className="mx-auto max-w-6xl px-6 py-3 text-center text-sm text-gray-600">
                © {new Date().getFullYear()} NovyBLOG. All rights reserved.
            </div>
        </footer>
    );
}
