# Docker descriptor for codbex-electra
# License - http://www.eclipse.org/legal/epl-v20.html

FROM ghcr.io/codbex/codbex-atlas:0.31.0

COPY codbex-electra target/dirigible/repository/root/registry/public/codbex-electra

ENV DIRIGIBLE_HOME_URL=/services/web/codbex-electra/gen/index.html