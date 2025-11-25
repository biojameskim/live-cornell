import Link from 'next/link';



export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">The page you are looking for does not exist.</p>
            <Link
                href="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Go back home
            </Link>
        </div>
    );
}
