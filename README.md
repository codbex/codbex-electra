# codbex-portunus

e-Commerce Backoffice Management

- [Demo instance](#demo-instance)
- [Build and Run](#build-and-run)
- [Architecture](#architecture)
	- [Design overview](#design-overview)
	- [DB Model](#db-model)
- [User interface](#user-interface)

## Demo instance
You can try the Portunus [here](https://dev.portunus.eu1.codbex.com).<br>
It is conifgured to use a [demo OpenCart instance](https://dev.opencart-demo.eu1.codbex.com).

## Build and Run

### Prerequisites
The following Eclipse Dirigible configurations should be available:

| Name | Example value |
|--|--|
| DIRIGIBLE_HOME_URL | /services/web/codbex-portunus/gen/index.html |
| PORTUNUS_OPENCART_DB_HOST | localhost |
| PORTUNUS_OPENCART_DB_PORT | 3306 |
| PORTUNUS_OPENCART_DB_NAME | bitnami_opencart |
| PORTUNUS_OPENCART_DB_USER | bn_opencart |
| PORTUNUS_OPENCART_DB_PASS | mypass |

[Here](https://www.dirigible.io/help/setup/setup-environment-variables/) is described how you can provide dirigbile configurations.

### Steps
To deploy and run the Portunus, you have to follow the steps described bellow.
- Get [Eclipse Dirigible](https://github.com/eclipse/dirigible) up and running by following the steps described in [here](https://github.com/eclipse/dirigible?tab=readme-ov-file#get-started)
- Clone the Portunus project `https://github.com/codbex/codbex-portunus.git` using the git perspective.
    ![git-clone](misc/images/portunus-git-clone.png)
    ![git-clone-url](misc/images/portunus-git-clone-url.png)

- Publish the Portunus project
    ![publish-all](misc/images/portunus-publish-all.png)

- After a few seconds, the Portunus should be available on the following path `/services/web/codbex-portunus/gen/index.html`. If the Dirigible is hosted on `localhost`, the URL will be  [http://localhost:8080/services/web/codbex-portunus/gen/index.html](http://localhost:8080/services/web/codbex-portunus/gen/index.html)

## Architecture

### Design overview
![design-overview](misc/design/portunus.svg)

### DB Model
![model](misc/images/portunus-model.png)

## User interface

### Launchpad
![application](misc/images/portunus-application.png)

### Management

#### Sales Orders
![salesorders](misc/images/portunus-salesorders.png)

#### Products
![products](misc/images/portunus-products.png)

#### Stores
![stores](misc/images/portunus-stores.png)

#### Currencies
![currencies](misc/images/portunus-currencies.png)

#### Employee Groups
![employeegroups](misc/images/portunus-employeegroups.png)

#### Employees
![employees](misc/images/portunus-employees.png)

#### Manufacturers
![manifacturers](misc/images/portunus-manufacturers.png)

#### Customers/Affiliates
![customers](misc/images/portunus-customers.png)

#### Attributes
![attributes](misc/images/portunus-attributes.png)

#### Settings
![settings](misc/images/portunus-settings.png)
