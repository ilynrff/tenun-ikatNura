-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "story" TEXT,
    "material" JSONB,
    "price" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "care" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "signature" BOOLEAN NOT NULL DEFAULT false,
    "archPosition" INTEGER NOT NULL DEFAULT 0,
    "categorySlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_categorySlug_idx" ON "products"("categorySlug");

-- CreateIndex
CREATE INDEX "products_isActive_isVisible_idx" ON "products"("isActive", "isVisible");

-- CreateIndex
CREATE INDEX "products_featured_idx" ON "products"("featured");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES "categories"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;
