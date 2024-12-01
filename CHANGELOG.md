## [1.1.4] (Unreleased)

### Bug fixes
 * Fixed CSRF Protection in PHP build
 * UI/UX updated in signature boxes in service forms
 * Updated service ID generation by modulus to ignore site overlap

### Features
 * Added About page link to the footer
 * Added new PHP based Media browser to StoreItems and StoreParts

### Deprecation
 * Firebase Storage functionality deprecated along with VITE_FIREBASE_STORAGE_BUCKET .env variable

## [1.1.3] (2024-11-26)

### Bug fixes
 * Optimized data loading, updating and missing data cases
 * Fixed refresh deleted data from DB

### Features
 * Added permanent caching solution for Firebase Storage images to reduce load time and refresh

## [1.1.2] (2024-11-21)

### Bug fixes
 * Removed Shop filtering from Recycle Bin
 * Update button fixed in Header menu
 * User assigned to specific shop had parts, and items empty fixed
 * Assets contain version in order to avoid caching issues.

### Features
 * Users can be assigned to multiple shops

## [1.1.1] (2024-11-13)

### Bug fixes

* Firebase Auth error handling improved
* ShopModal regexp validation fixed
* Signature border is more visible
* Comma prefix issue fixed in StyledMultiSelect

### Features

* Multiselect box changed to List of checkboxes in Service forms
* TableViewComponent support multi selection
* Import Shop Data dialog added to Shop list
* Item and Part deleted only in case when we remove from all shops


## [1.1.0] (2024-11-04)

### Bug fixes

* Parts and Items page fixes: [(84317ad)](https://github.com/Reterics/storager/commit/84317ad6049b30a32d65b61dff1cb7163ed979c2)
  * fix: Assigned shop value
  * fix: Low storage alert boolean
  * test: Increased storage coverage

* Service Management: [(fb7f732)](https://github.com/Reterics/storager/commit/fb7f73203672c4cc2e767f235c22a988cf401039)
  * fix: Completion form does not close service anymore
  * fix: Service form history loads the right form now
  * fix: Completion form didn't have default description before
  * fix: Service form stays editable after completion form is done
  * fix: Completion form print view enabled
  * fix: Service and Completion form must be signed
  * fix: Service id generation fixed (counting deleted ones)

* GeneralModal:
  * fix: Save button resets if the validation failed (onClick -> false) [(448dce9)](https://github.com/Reterics/storager/commit/448dce9188c7f087429f4016b18dd0145e4e53a9)
  * fix: Validation updates on Item, Part and UserModal [(ce85ff8)](https://github.com/Reterics/storager/commit/ce85ff89a35fa4ae3ff3c38f7ce9780efc59c710)

* Footer: [(fb7f732)](https://github.com/Reterics/storager/commit/fb7f73203672c4cc2e767f235c22a988cf401039)
  * fix: translation for light mode
  * feat: compact design

### Features

* **Recycle bin**: Initial delete won't remove the data from Firestore [(8bcfbde)](https://github.com/Reterics/storager/commit/8bcfbdefdf54cca2441fbd6973e3559d1a0ff2c1)
