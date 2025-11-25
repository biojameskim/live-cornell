export default function MorePage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar is in layout */}
            <main className="container mx-auto py-10 px-4">
                <h1 className="text-4xl font-bold text-slate-900 mb-8">Housing Information</h1>

                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">University Housing vs. Off-Campus Rental Housing</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Most graduate students live in off-campus rental housing in Ithaca or the surrounding areas.
                            The university maintains a website that lists rental properties. This is a very useful resource
                            for finding apartments and houses for rent.
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            Cornell also offers on-campus housing for graduate students. Demand is high, so it is
                            advisable to apply early if you are interested.
                        </p>
                    </section>

                    <hr className="border-slate-200" />

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Buying a Home</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Some students choose to buy a home in Ithaca. The real estate market in Ithaca can be competitive,
                            but owning a home can be a good investment.
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            If you are considering buying, it is recommended to work with a local real estate agent who
                            knows the market well.
                        </p>
                    </section>

                    <hr className="border-slate-200" />

                    <section>
                        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Neighborhoods</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-xl font-medium text-slate-900 mb-2">Collegetown</h3>
                                <p className="text-slate-600">
                                    Adjacent to campus, very convenient but can be noisy and expensive. Popular with undergraduates and some grad students.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-slate-900 mb-2">Downtown / Fall Creek</h3>
                                <p className="text-slate-600">
                                    A short bus ride or walk to campus. More residential feel, popular with graduate students and locals. Great access to restaurants and shops.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-slate-900 mb-2">Cayuga Heights</h3>
                                <p className="text-slate-600">
                                    Quiet, residential area north of campus. More expensive, larger homes. Good for families.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-slate-900 mb-2">Belle Sherman</h3>
                                <p className="text-slate-600">
                                    Quiet residential area east of Collegetown. Walking distance to campus but more suburban feel.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
