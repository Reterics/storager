## [1.1.0] (Unreleased)


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

* GeneralModal:
  * fix: Save button resets if the validation failed (onClick -> false)
  * fix: Validation updates on Item, Part and UserModal
* Footer: [(fb7f732)](https://github.com/Reterics/storager/commit/fb7f73203672c4cc2e767f235c22a988cf401039)
  * fix: translation for light mode
  * feat: compact design

### Features

* **Recycle bin**: Initial delete won't remove the data from Firestore [(8bcfbde)](https://github.com/Reterics/storager/commit/8bcfbdefdf54cca2441fbd6973e3559d1a0ff2c1)
