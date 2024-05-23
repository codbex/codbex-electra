# Docker descriptor for codbex-electra
# License - http://www.eclipse.org/legal/epl-v20.html

FROM ghcr.io/codbex/codbex-atlas:0.33.0

COPY . target/dirigible/repository/root/registry/public

ENV DIRIGIBLE_HOME_URL=/services/web/codbex-electra/ui/index.html

EXPOSE 80
