# WooCommerce import

Two CSVs, both generated from the storefront catalogue
(`assets/js/products.js`) by `npm run woocommerce`.

| File | Shape | Rows |
| --- | --- | --- |
| `products-variable.csv` | Variable products — one parent per fragrance with **Size** and **Version** dropdowns | 81 |
| `products-simple.csv` | The same catalogue flattened to one row per purchasable option | 65 |

Covers **16 fragrances** and **65 purchasable options**.

## How to import

1. WooCommerce → **Products** → **Import** → choose the CSV → **Continue**.
2. On the mapping step, leave WooCommerce's suggested column mapping as it is —
   the headers already use its standard names.
3. Import. Categories (`Women`, `Men`, `Unisex`, plus every house) and tags
   are created automatically.

**Start with `products-variable.csv`.** If your WooCommerce version objects to
the variation rows, fall back to `products-simple.csv`, which needs no
attribute setup at all — you get 65 simple products instead of
16 variable ones.

## Notes

- Prices are in USD and are **demo values**. Adjust them before you publish.
- The **Version** attribute carries the commercial story: `Original Bottle` is
  the sealed designer fragrance, `Julie Scents Recreate` is the in-house blend.
  Keep both visible so customers can compare prices on the product page.
- The **Images** column contains a relative path
  (`assets/img/products/<slug>.webp`). WooCommerce needs a real URL, so either
  upload the images to the Media Library and replace the paths, or blank the
  column and attach images in the admin. Replace with the Media Library URL after uploading assets/img/products/<slug>.webp, or leave blank and add images in WooCommerce.
- Stock is set to 25 per variation as a placeholder.
