# Docker descriptor for codbex-electra
# License - http://www.eclipse.org/legal/epl-v20.html

FROM ghcr.io/codbex/codbex-atlas:0.34.0

COPY . target/dirigible/repository/root/registry/public
COPY . target/dirigible/repository/root/users/admin/workspace

ENV DIRIGIBLE_HOME_URL=/services/web/codbex-electra/ui/index.html

EXPOSE 80
