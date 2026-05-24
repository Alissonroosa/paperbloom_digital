/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'imagem.paperbloom.com.br',
            },
            {
                protocol: 'https',
                hostname: '**.r2.cloudflarestorage.com',
            },
            {
                // Subdomínios públicos do R2 (ex: pub-xxx.r2.dev) — inclui placeholders do catálogo
                protocol: 'https',
                hostname: '**.r2.dev',
            },
        ],
    },
    // Enable standalone output for Docker
    output: 'standalone',
    async redirects() {
        return [
            {
                source: '/produtos',
                destination: '/experiencias',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
