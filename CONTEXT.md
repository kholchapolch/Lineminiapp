# Badge Pilot Domain Glossary

## Badge Rule

A configured badge definition that can appear on the badge shelf.

A badge rule owns the badge identity, display grouping, active campaign window, registration window, unlock levels, and rule conditions.

## Badge Shelf

The customer-facing list of badges that can be earned.

The shelf shows both achieved and not-yet-achieved badges so the customer can see what they can work toward.

## Threshold

An unlock level for a badge rule.

A threshold defines the displayed level name, required count, achieved image, locked image, and display order. A badge rule may have one threshold or many thresholds.

## Condition

A set of product requirements inside a badge rule.

A condition defines how products in its SKU list are counted: any one, all products, or a minimum number from the list.

The same Sony SKU may appear in more than one badge rule or condition.

## Sony Product

A product ownership record returned by Sony API.

The badge system uses Sony product SKUs and registration dates to calculate badge progress.

## Matched Count

The total progress score calculated for a badge rule after matching customer Sony products against the rule conditions.

Each condition contributes up to its own required count.

## Required Count

The count needed to satisfy either a condition or a threshold.

For a condition, required count means how many matching products are needed inside that condition's SKU list. For a threshold, required count means how much total matched count is needed to unlock that badge level.

## Composed Rule

A badge rule built from multiple simple conditions and thresholds.

Composed rules can express combinations such as one product from one SKU list plus all products from another SKU list, or multiple badge levels from the same product list.
