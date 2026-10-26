# Optional AWS audit foundation / Fundação opcional de auditoria AWS

**Not deployed. No paid resource has been created.** This directory defines SQS/DLQ, private S3 and a log group. It does not provision the full application. Review [cloud alternatives](../../docs/cloud.md) first.

Terraform was not available during authoring. No claim of successful `terraform init`, `terraform validate`, plan or apply is made. The provider constraint selects the 5.x family; run `init` and commit the generated lockfile in a controlled deployment change to record exact package checksums. There are no credentials in these files.

## Review-only workflow

Install an approved Terraform 1.x release, then:

```sh
cd infra/aws
terraform init -backend=false
terraform fmt -check
terraform validate
```

These commands obtain provider packages and check configuration; they do not create cloud resources. `terraform plan -var='name=your-unique-lab-prefix'` additionally contacts AWS and requires authorized credentials. No `apply` is part of project build or CI.

Before deployment: establish a remote encrypted state backend with locking, least-privilege deployment and application roles, budgets, retention approval and owner. The example 30-day object, 14-day log and 4/14-day queue retention settings are illustrative, not DoorDash retention policies. The bucket prevents public access and denies insecure transport. Consumers still need payload minimization, idempotent processing and authorization. Do not place production message text in this laboratory.

## Português

Esta configuração é uma base inspecionável, não uma plataforma em produção. Ela cria somente fila, fila de mensagens não processadas, bucket privado e grupo de logs **se alguém executar um apply autorizado**. Nada foi provisionado neste trabalho. A validação Terraform não foi executada porque o binário não estava disponível; não confundir revisão estática com implantação validada.

Os comandos acima inicializam dependências e verificam a configuração. Um plano precisa de credenciais autorizadas; aplicar pode gerar cobrança. Antes disso, definir estado remoto cifrado com locking, identidade de implantação e aplicação com mínimo privilégio, orçamento, responsável e política de retenção. Os prazos ilustrativos não representam políticas internas da DoorDash. A fila usa entrega padrão; o consumidor precisa deduplicar efeitos. A arquitetura completa ainda precisa de rede, serviço de aplicação, autenticação, observabilidade integrada, armazenamento de decisão e testes de recuperação.
