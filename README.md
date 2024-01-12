# codbex-electra

e-Commerce Backoffice Management

- [Demo instance](#demo-instance)
- [Build and Run](#build-and-run)
- [Architecture](#architecture)
	- [Design overview](#design-overview)
	- [DB Model](#db-model)
    - [Data synchronization](#data-synchronization)
- [User interface](#user-interface)

## Demo instance
You can try the Electra [here](https://dev.electra.eu1.codbex.com).<br>
It is conifgured to use a [demo OpenCart instance](https://dev.opencart-demo.eu1.codbex.com).<br>
Details about the configured OpenCart instance could be found [here](https://github.com/codbex/products-documentation/blob/main/opencart/README.md#opencart-303-8).

## Build and Run

### Prerequisites
The following Eclipse Dirigible configurations should be available:

| Name | Example value |
|--|--|
| DIRIGIBLE_HOME_URL | /services/web/codbex-electra/gen/index.html |
| ELECTRA_OPENCART_DB_HOST | localhost |
| ELECTRA_OPENCART_DB_PORT | 3306 |
| ELECTRA_OPENCART_DB_NAME | bitnami_opencart |
| ELECTRA_OPENCART_DB_USER | bn_opencart |
| ELECTRA_OPENCART_DB_PASS | mypass |

[Here](https://www.dirigible.io/help/setup/setup-environment-variables/) is described how you can provide dirigbile configurations.

### Steps
To deploy and run the Electra, you have to follow the steps described bellow.
- Get [Eclipse Dirigible](https://github.com/eclipse/dirigible) up and running by following the steps described in [here](https://github.com/eclipse/dirigible?tab=readme-ov-file#get-started)
- Clone the Electra project `https://github.com/codbex/codbex-electra.git` using the git perspective.

    ![git-clone](misc/images/git-clone.png)

    ![git-clone-url](misc/images/git-clone-url.png)

- Publish the Electra project

    ![publish-all](misc/images/publish-all.png)

- After a few seconds, the Electra should be available on the following path `/services/web/codbex-electra/gen/index.html`. If the Dirigible is hosted on `localhost`, the URL will be  [http://localhost:8080/services/web/codbex-electra/gen/index.html](http://localhost:8080/services/web/codbex-electra/gen/index.html)

## Architecture

### Design overview
![design-overview](misc/design/electra.svg)
---
### DB Model
![model](misc/images/arch/db-model.png)
---
### Data synchronization

#### Data replication from OpenCart to Electra
Since OpenCart UI is used by the shop customers to purchase goods, create account and so on, and the products are managed (added, updated, deleted) in the OpenCart admin UI, we have to replicate data from OpenCart to Electra DB. This is done by synchronizers implemented as `*.camel` files which are located [here](codbex-electra-opencart/synchronization/).<br>

In the following table you can find more details about tables mapping.

| OpenCart Table | Electra Table | Synch frequency | Details | Example execution |
|--|--|--|--|--|
| oc_order_product | CODBEX_SALESORDERITEM | every minute | [here](codbex-electra-opencart/synchronization/sync-order-items.camel) | 12:00:00<br>12:01:00<br>12:02:00 |
| oc_product | CODBEX_PRODUCT | every minute | [here](codbex-electra-opencart/synchronization/sync-products.camel) | 12:00:01<br>12:01:01<br>12:02:01 |
| oc_manufacturer | CODBEX_MANUFACTURER | every minute | [here](codbex-electra-opencart/synchronization/sync-manufacturers.camel) | 12:00:02<br>12:01:02<br>12:02:02 |
| oc_order | CODBEX_SALESORDER | every minute | [here](codbex-electra-opencart/synchronization/sync-orders.camel) | 12:00:03<br>12:01:03<br>12:02:03 |
| oc_order | CODBEX_SALESORDERPAYMENT | every minute | [here](codbex-electra-opencart/synchronization/sync-orders.camel) | 12:00:03<br>12:01:03<br>12:02:03 |
| oc_order | CODBEX_SALESORDERSHIPPING | every minute | [here](codbex-electra-opencart/synchronization/sync-orders.camel) | 12:00:03<br>12:01:03<br>12:02:03 |
| oc_customer | CODBEX_CUSTOMER | every minute | [here](codbex-electra-opencart/synchronization/sync-customers.camel) | 12:00:04<br>12:01:04<br>12:02:04 |
| oc_country | CODBEX_COUNTRY | hourly | [here](codbex-electra-opencart/synchronization/sync-countries.camel) | 12:30:00<br>13:30:00<br>14:30:00 |
| oc_currency | CODBEX_CURRENCY | hourly | [here](codbex-electra-opencart/synchronization/sync-currencies.camel) | 12:30:01<br>13:30:01<br>14:30:01 |
| oc_language | CODBEX_LANGUAGE | hourly | [here](codbex-electra-opencart/synchronization/sync-languages.camel) | 12:30:02<br>13:30:02<br>14:30:02 |
| oc_stock_status | CODBEX_STOCKSTATUS | hourly | [here](codbex-electra-opencart/synchronization/sync-stock-statuses.camel) | 12:30:03<br>13:30:03<br>14:30:03 |
| oc_store | CODBEX_STORE | hourly | [here](codbex-electra-opencart/synchronization/sync-stores.camel) | 12:30:04<br>13:30:04<br>14:30:04 |
| oc_zone | CODBEX_ZONE | hourly | [here](codbex-electra-opencart/synchronization/sync-zones.camel) | 12:30:05<br>13:30:05<br>14:30:05 |
| oc_order_status | CODBEX_SALESORDERITEM | hourly | [here](codbex-electra-opencart/synchronization/sync-order-status.camel) | 12:30:06<br>13:30:06<br>14:30:06 |

OpenCart DB model could be found [here](https://github.com/opencart/opencart/blob/3.0.3.8/upload/install/opencart.sql).

## User interface

### Launchpad
![application](misc/images/user-interface/launchpad.png)

### Management

#### Sales Orders
![salesorders](misc/images/user-interface/sales-orders.png)

#### Products
![products](misc/images/user-interface/products.png)

#### Stores
![stores](misc/images/user-interface/stores.png)

#### Currencies
![currencies](misc/images/user-interface/currencies.png)

#### Employee Groups
![employeegroups](misc/images/user-interface/teams.png)

#### Employees
![employees](misc/images/user-interface/employees.png)

#### Manufacturers
![manifacturers](misc/images/user-interface/manufacturers.png)

#### Customers/Affiliates
![customers](misc/images/user-interface/customers.png)

#### Attributes
![attributes](misc/images/user-interface/attributes.png)

#### Settings
![settings](misc/images/user-interface/settings.png)
