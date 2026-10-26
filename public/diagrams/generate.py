"""Rebuild all bilingual architecture diagrams with Python 3, no dependencies.

Geometry is authored, not auto-routed: nodes have fixed lanes; connectors stay
outside cards. SVG title/description provide the same accessible reading order
as src/data/diagrams.ts. Run from any directory: python3 generate.py.
"""
from pathlib import Path
from html import escape
import json
import textwrap
import base64

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
INK = '#18202c'
MUTED = '#637083'
COLORS = {'sync': '#d94135', 'async': '#4174a6', 'policy': '#7560a9', 'human': '#b67d24'}
DATA = []

def pair(pt, en):
    return {'pt': pt, 'en': en}

def item(id, title, description, status, nodes=None, events=None, note=None):
    d = dict(id=id, title=title, description=description, status=status, nodes=nodes, events=events, note=note)
    DATA.append(d)
    return d

item('context', pair('Contexto do sistema', 'System context'),
     pair('Estudo independente: pessoas, laboratório e limites da proposta.', 'Independent study: people, laboratory and proposal boundaries.'), 'proposed', [
    (pair('Avaliador', 'Reviewer'), pair('Explora cenários sintéticos', 'Explores synthetic scenarios'), 'sync'),
    (pair('Portal independente', 'Independent portal'), pair('React · TypeScript · navegador', 'React · TypeScript · browser'), 'sync'),
    (pair('Motor demonstrativo', 'Demonstration engine'), pair('Regras reproduzíveis · sem LLM', 'Reproducible rules · no LLM'), 'sync'),
    (pair('Operação humana', 'Human operations'), pair('Fluxo proposto · sem integração', 'Proposed flow · no integration'), 'human'),
    (pair('Referência local', 'Local reference'), pair('Python · FastAPI · MCP', 'Python · FastAPI · MCP'), 'policy'),
    (pair('Dados de demonstração', 'Demonstration data'), pair('Políticas e casos sintéticos', 'Synthetic policies and cases'), 'async')],
    note=pair('O portal não se conecta à DoorDash. A API local e a operação humana são ambientes separados.', 'The portal does not connect to DoorDash. The local API and human operations are separate environments.'))

item('containers', pair('Containers e serviços', 'Containers and services'),
     pair('Três limites explícitos: página estática, referência local e produção proposta.', 'Three explicit boundaries: static page, local reference and proposed production.'), 'proposed', [
    (pair('GitHub Pages', 'GitHub Pages'), pair('HTML · CSS · JavaScript', 'HTML · CSS · JavaScript'), 'sync'),
    (pair('Aplicação React', 'React application'), pair('Interações e explicações', 'Interactions and explanations'), 'sync'),
    (pair('engine.ts', 'engine.ts'), pair('Classificação e decisão local', 'Local classification and decision'), 'sync'),
    (pair('Trabalhadores e banco', 'Workers and database'), pair('Produção proposta · não ativos', 'Proposed production · inactive'), 'async'),
    (pair('MCP somente leitura', 'Read-only MCP'), pair('Políticas e casos de laboratório', 'Laboratory policies and cases'), 'policy'),
    (pair('FastAPI local', 'Local FastAPI'), pair('/moderate · /policies', '/moderate · /policies'), 'sync')],
    note=pair('O navegador funciona sem backend. As caixas inferiores não representam serviços ativos no site público.', 'The browser works without a backend. Lower boxes are not active services on the public site.'))

item('core', pair('Componentes do núcleo', 'Core components'),
     pair('A fatia executável usa regras determinísticas e políticas versionadas.', 'The executable slice uses deterministic rules and versioned policies.'), 'implemented', [
    (pair('01 · Validar', '01 · Validate'), pair('Mensagem e parâmetros', 'Message and parameters'), 'sync'),
    (pair('02 · Contextualizar', '02 · Add context'), pair('Janela sintética fornecida', 'Supplied synthetic window'), 'sync'),
    (pair('03 · Classificar', '03 · Classify'), pair('Sinais explícitos · score simulado', 'Explicit signals · simulated score'), 'sync'),
    (pair('06 · Explicar', '06 · Explain'), pair('Regra, evidência e versão', 'Rule, evidence and version'), 'async'),
    (pair('05 · Decidir', '05 · Decide'), pair('Ação limitada pela política', 'Policy-constrained action'), 'sync'),
    (pair('04 · Aplicar política', '04 · Apply policy'), pair('Limiares e contingência', 'Thresholds and contingency'), 'policy')],
    note=pair('Scores e tempos exibidos são cenários ilustrativos. Não há inferência de modelo real no navegador.', 'Displayed scores and timings are illustrative scenarios. No real model inference runs in the browser.'))

item('data-flow', pair('Fluxo de dados e auditoria', 'Data flow and audit'),
     pair('A decisão local produz um registro legível; persistência assíncrona é uma evolução proposta.', 'The local decision produces a readable record; asynchronous persistence is a proposed evolution.'), 'proposed', [
    (pair('Mensagem sintética', 'Synthetic message'), pair('Entrada não confiável', 'Untrusted input'), 'sync'),
    (pair('Validação e decisão', 'Validation and decision'), pair('Caminho síncrono do laboratório', 'Synchronous laboratory path'), 'sync'),
    (pair('Resultado na interface', 'Interface result'), pair('Ação · motivo · política', 'Action · reason · policy'), 'sync'),
    (pair('Avaliação offline', 'Offline evaluation'), pair('Revisão e conjunto autorizado', 'Review and approved dataset'), 'human'),
    (pair('Auditoria minimizada', 'Minimized audit'), pair('Sem texto bruto por padrão', 'No raw text by default'), 'async'),
    (pair('Outbox + fila', 'Outbox + queue'), pair('Proposta · fora da entrega', 'Proposal · off delivery path'), 'async')],
    note=pair('Em produção, a entrega não espera o consumidor de auditoria. Outbox durável e deduplicação exigem implementação.', 'In production, delivery does not wait for the audit consumer. A durable outbox and deduplication require implementation.'))

item('deployment', pair('Implantação de referência', 'Reference deployment'),
     pair('Site estático executável e uma alternativa AWS ainda não provisionada.', 'Executable static site and an AWS alternative that has not been provisioned.'), 'proposed', [
    (pair('GitHub Actions', 'GitHub Actions'), pair('Verificação e build estático', 'Checks and static build'), 'sync'),
    (pair('GitHub Pages', 'GitHub Pages'), pair('Distribui o portal público', 'Distributes the public portal'), 'sync'),
    (pair('Navegador', 'Browser'), pair('Simulação sem credenciais', 'Simulation without credentials'), 'sync'),
    (pair('SQS · S3 · RDS', 'SQS · S3 · RDS'), pair('Auditoria e dados · proposta', 'Audit and data · proposal'), 'async'),
    (pair('ECS Fargate', 'ECS Fargate'), pair('API privada · duas zonas', 'Private API · two zones'), 'sync'),
    (pair('Entrada autenticada', 'Authenticated ingress'), pair('TLS · autorização · proposta', 'TLS · authorization · proposal'), 'policy')],
    note=pair('AWS é uma arquitetura alternativa, sem recursos pagos criados. Não existe conexão implícita entre Pages e AWS.', 'AWS is an alternative architecture; no paid resources were created. There is no implicit Pages-to-AWS connection.'))

item('sequence-allow', pair('Sequência · mensagem liberada', 'Sequence · allowed message'),
     pair('Fluxo do laboratório para uma mensagem sintética sem sinal de risco.', 'Laboratory flow for a synthetic message without a risk signal.'), 'implemented',
    [pair('Interface', 'Interface'), pair('Motor', 'Engine'), pair('Política', 'Policy'), pair('Registro local', 'Local record')], [
    (0,1,pair('1 · Mensagem + contexto sintético', '1 · Message + synthetic context'),'sync'),
    (1,2,pair('2 · Categoria + score ilustrativo', '2 · Category + illustrative score'),'policy'),
    (2,1,pair('3 · Regra aplicável + versão', '3 · Applicable rule + version'),'policy'),
    (1,3,pair('4 · Ação + motivo resumido', '4 · Action + brief reason'),'async'),
    (1,0,pair('5 · Liberar na demonstração', '5 · Allow in demonstration'),'sync')],
    note=pair('Liberar significa exibir a decisão no laboratório. Nenhuma mensagem real é enviada.', 'Allow means display the laboratory decision. No real message is sent.'))

item('sequence-flag', pair('Sequência · conteúdo sinalizado', 'Sequence · flagged content'),
     pair('A política limita a ação; um sinal não autoriza medidas sobre contas.', 'Policy constrains the action; a signal does not authorize account actions.'), 'implemented',
    [pair('Interface', 'Interface'), pair('Motor', 'Engine'), pair('Política', 'Policy'), pair('Registro local', 'Local record')], [
    (0,1,pair('1 · Cenário sintético de risco', '1 · Synthetic risk scenario'),'sync'),
    (1,2,pair('2 · Evidência + limiar configurado', '2 · Evidence + configured threshold'),'policy'),
    (2,1,pair('3 · Regra de sinalização / revisão', '3 · Flag / review rule'),'policy'),
    (1,3,pair('4 · Motivo + versão da política', '4 · Reason + policy version'),'async'),
    (1,0,pair('5 · Exibir decisão e encaminhamento', '5 · Display decision and referral'),'sync')],
    note=pair('O encaminhamento é demonstrativo. Não existe fila de agentes, cancelamento ou suspensão real.', 'Referral is demonstrative. There is no live agent queue, cancellation or suspension.'))

item('sequence-timeout', pair('Sequência · timeout e contingência', 'Sequence · timeout and fallback'),
     pair('Falha injetada no cenário; resposta conservadora explícita por política.', 'Scenario-injected failure; explicit conservative policy response.'), 'implemented',
    [pair('Interface', 'Interface'), pair('Motor', 'Engine'), pair('Política', 'Policy'), pair('Registro local', 'Local record')], [
    (0,1,pair('1 · Ativar cenário de indisponibilidade', '1 · Enable unavailable scenario'),'sync'),
    (1,2,pair('2 · Consultar contingência por risco', '2 · Read risk-based fallback'),'policy'),
    (2,1,pair('3 · Decisão limitada + revisão', '3 · Constrained decision + review'),'human'),
    (1,3,pair('4 · Registrar rota de contingência', '4 · Record fallback route'),'async'),
    (1,0,pair('5 · Explicar falha e recuperação', '5 · Explain failure and recovery'),'sync')],
    note=pair('A indisponibilidade é simulada, não um timeout medido. Não há repetição ilimitada no caminho crítico.', 'Unavailability is simulated, not a measured timeout. There is no unbounded retry in the critical path.'))

item('sequence-appeal', pair('Sequência · revisão e contestação', 'Sequence · review and appeal'),
     pair('Processo de produção proposto, separado do fluxo demonstrativo.', 'Proposed production process, separate from the demonstration flow.'), 'proposed',
    [pair('Pessoa usuária', 'User'), pair('Serviço de casos', 'Case service'), pair('Revisor autorizado', 'Authorized reviewer'), pair('Auditoria', 'Audit')], [
    (0,1,pair('1 · Contestação + identidade validada', '1 · Appeal + verified identity'),'sync'),
    (1,2,pair('2 · Caso minimizado + política vigente', '2 · Minimized case + current policy'),'human'),
    (2,1,pair('3 · Decisão autorizada e justificada', '3 · Authorized, justified decision'),'human'),
    (1,3,pair('4 · Evento idempotente + versão', '4 · Idempotent event + version'),'async'),
    (1,0,pair('5 · Resultado e canal de suporte', '5 · Outcome and support channel'),'sync')],
    note=pair('Controles necessários: acesso por função, segregação, prazo, proteção contra repetição e rastreabilidade.', 'Required controls: role-based access, separation of duties, deadline, replay protection and traceability.'))

item('sequence-policy-tools', pair('Sequência · políticas e ferramentas', 'Sequence · policies and tools'),
     pair('MCP de referência consulta políticas sintéticas com validação de ferramenta.', 'Reference MCP retrieves synthetic policies with tool validation.'), 'implemented',
    [pair('Cliente local', 'Local client'), pair('Servidor MCP', 'MCP server'), pair('Lista permitida', 'Tool allowlist'), pair('Políticas locais', 'Local policies')], [
    (0,1,pair('1 · tools/list', '1 · tools/list'),'sync'),
    (1,0,pair('2 · Nomes e schemas somente leitura', '2 · Read-only names and schemas'),'sync'),
    (0,1,pair('3 · tools/call: search_policies', '3 · tools/call: search_policies'),'policy'),
    (1,2,pair('4 · Validar nome e argumentos', '4 · Validate name and arguments'),'policy'),
    (1,3,pair('5 · Busca lexical por tema', '5 · Lexical topic search'),'policy'),
    (3,1,pair('6 · Fonte, versão e trecho', '6 · Source, version and excerpt'),'policy'),
    (1,0,pair('7 · Evidência ou ausência de resultado', '7 · Evidence or no result'),'policy')],
    note=pair('Inicialização precede a consulta. MCP não autoriza ações. get_case_preview também lê somente casos sintéticos.', 'Initialization precedes queries. MCP does not authorize actions. get_case_preview also reads synthetic cases only.'))

def txt(x, y, value, size=17, color=INK, weight=500, anchor='start'):
    return f'<text x="{x}" y="{y}" text-anchor="{anchor}" fill="{color}" font-size="{size}" font-weight="{weight}">{escape(value)}</text>'

def line(points, kind='sync', arrow=True):
    dash = ' stroke-dasharray="6 6"' if kind == 'async' else ''
    marker = f' marker-end="url(#{kind})"' if arrow else ''
    return f'<polyline points="{" ".join(f"{x},{y}" for x,y in points)}" fill="none" stroke="{COLORS[kind]}" stroke-width="2.2" stroke-linejoin="round"{dash}{marker}/>'

def card(x, y, title, sub, kind, width=300):
    icon = None
    for word, name in [('GitHub', 'github.png'), ('React', 'react.svg'), ('engine.ts', 'typescript.svg'), ('FastAPI', 'fastapi.svg'), ('MCP', 'mcp.svg'), ('Fargate', 'aws.png'), ('SQS', 'aws.png')]:
        if word in title and (ROOT/'public/brand'/name).exists():
            icon = ROOT/'public/brand'/name
            break
    mark = f'<rect x="{x+18}" y="{y+21}" width="4" height="25" rx="2" fill="{COLORS[kind]}"/>'
    title_x = x+34
    if icon:
        mime = 'image/svg+xml' if icon.suffix=='.svg' else 'image/png'
        raw = icon.read_bytes()
        if icon.name == 'mcp.svg':
            # Display the official symbol portion of its wide wordmark without distorting it.
            raw = raw.replace(b'viewBox="0 0 1338 195"', b'viewBox="0 0 195 195"').replace(b'width="1338"', b'width="195"')
        data = base64.b64encode(raw).decode('ascii')
        mark = f'<image x="{x+19}" y="{y+20}" width="28" height="28" href="data:{mime};base64,{data}"/>'
        if icon.name == 'fastapi.svg':
            mark = f'<rect x="{x+18}" y="{y+19}" width="30" height="30" rx="8" fill="#009688"/>'+mark
        title_x = x+60
    return (f'<rect x="{x}" y="{y}" width="{width}" height="108" rx="17" fill="white" stroke="#dfe4ea"/>'
        +mark+txt(title_x,y+42,title,18,weight=650)+txt(x+22,y+77,sub,14.5,MUTED))

def render(d, lang):
    title=d['title'][lang]; description=d['description'][lang]
    labels = [d['nodes'][i][lang] if d['events'] else d['nodes'][i][0][lang] for i in range(len(d['nodes']))]
    reading = '. '.join(labels)
    status = ('LABORATÓRIO EXECUTÁVEL' if lang=='pt' else 'EXECUTABLE LABORATORY') if d['status']=='implemented' else ('ARQUITETURA PROPOSTA' if lang=='pt' else 'PROPOSED ARCHITECTURE')
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760" role="img" aria-labelledby="title desc" lang="{lang}">', f'<title id="title">{escape(title)}</title><desc id="desc">{escape(description+" "+reading+". "+d["note"][lang])}</desc>', '<defs>']
    for key,col in COLORS.items():
        out.append(f'<marker id="{key}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 1 L 9 5 L 0 9 z" fill="{col}"/></marker>')
    out+=['</defs>','<rect width="1200" height="760" rx="24" fill="#f8fafc"/>','<g font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif">',txt(44,43,'TRUST, BY DESIGN',12,MUTED,700),txt(1156,43,status,11,MUTED,650,'end'),txt(44,89,title,29,weight=680),txt(44,119,description,16,MUTED)]
    if d['events']:
        xs=[145,448,751,1054]
        for i,n in enumerate(d['nodes']):
            out.append(f'<rect x="{xs[i]-110}" y="156" width="220" height="58" rx="13" fill="white" stroke="#dfe4ea"/>')
            out.append(txt(xs[i],191,n[lang],16,weight=650,anchor='middle'))
            out.append(f'<line x1="{xs[i]}" y1="217" x2="{xs[i]}" y2="609" stroke="#ccd4de" stroke-dasharray="4 6"/>')
        for i,(a,b,label,kind) in enumerate(d['events']):
            y=250+i*(340/max(1,len(d['events'])-1))
            out.append(line([(xs[a],y),(xs[b],y)],kind))
            x=(xs[a]+xs[b])/2
            out.append(f'<rect x="{x-188}" y="{y-28}" width="376" height="23" rx="5" fill="#f8fafc"/>')
            out.append(txt(x,y-12,label[lang],14.5,COLORS[kind],550,'middle'))
    else:
        # Two independent horizontal lanes for context, containers, deployment.
        independent=d['id'] in ['context','containers','deployment']
        positions=[(44,210),(450,210),(856,210),(44,445),(450,445),(856,445)]
        if independent:
            lane1=pair('EXPÉRIÊNCIA PÚBLICA · NAVEGADOR', 'PUBLIC EXPERIENCE · BROWSER')[lang]
            lane2=pair('CONTEXTO SEPARADO · REFERÊNCIA / PROPOSTA', 'SEPARATE CONTEXT · REFERENCE / PROPOSAL')[lang]
        else:
            lane1=pair('CAMINHO SÍNCRONO · DECISÃO', 'SYNCHRONOUS PATH · DECISION')[lang]
            lane2=pair('EXPLICAÇÃO E AUDITORIA', 'EXPLANATION AND AUDIT')[lang]
        for y,label in [(174,lane1),(409,lane2)]:
            out.append(f'<rect x="27" y="{y-22}" width="1146" height="187" rx="20" fill="none" stroke="#d9e0e8" stroke-dasharray="5 6"/>')
            out.append(txt(44,y,label,11,MUTED,650))
        for i,(title,sub,kind) in enumerate(d['nodes']):
            out.append(card(*positions[i],title[lang],sub[lang],kind))
        out += [line([(344,264),(443,264)]),line([(750,264),(849,264)])]
        if independent:
            if d['id']=='context':
                out.append(line([(856,499),(757,499)],'policy'))
            elif d['id']=='deployment':
                out+=[line([(856,499),(757,499)],'policy'),line([(450,499),(351,499)],'async')]
            # Local FastAPI and MCP are independent entrypoints, not callers of each other.
        else:
            out+=[line([(1006,318),(1006,438)],'async' if d['id']=='data-flow' else 'policy'),line([(856,499),(757,499)],'async' if d['id']=='data-flow' else 'sync'),line([(450,499),(351,499)],'async')]
    for i,(kind,label) in enumerate([('sync',pair('Synchrone','Synchronous')),('async',pair('Asynchrone / trace','Async / trace')),('policy',pair('Politique / contrôle','Policy / control')),('human',pair('Revisão humana','Human review'))]):
        # Portuguese labels are intentionally authored rather than browser-translated.
        if lang=='pt': label={'pt':['Síncrono','Assíncrono / registro','Política / controle','Revisão humana'][i]}
        x=44+i*286
        out.append(line([(x,655),(x+28,655)],kind,False));out.append(txt(x+39,660,label[lang],13,MUTED))
    for i,t in enumerate(textwrap.wrap(d['note'][lang],width=128)):
        out.append(txt(44,706+i*21,t,14,MUTED))
    out+=['</g>','</svg>']
    return '\n'.join(out)

def main():
    exports=[]
    for d in DATA:
        entry={k:d[k] for k in ['id','title','description','status']}
        entry['src']={lang:f'diagrams/{d["id"]}-{lang}.svg' for lang in ['pt','en']}
        entry['text']={}
        for lang in ['pt','en']:
            (HERE/f'{d["id"]}-{lang}.svg').write_text(render(d,lang),encoding='utf8')
            if d['events']:
                steps=[f'{d["nodes"][a][lang]} → {d["nodes"][b][lang]}: {label[lang]}' for a,b,label,_ in d['events']]
            else:
                order=[0,1,2,5,4,3]
                steps=[f'{d["nodes"][i][0][lang]}: {d["nodes"][i][1][lang]}' for i in order]
            entry['text'][lang]='. '.join(steps)+'. '+d['note'][lang]
        exports.append(entry)
    header='// Generated by public/diagrams/generate.py; edit the generator to keep assets and labels aligned.\nexport type Diagram = { id: string; title: {pt:string;en:string}; description: {pt:string;en:string}; src: {pt:string;en:string}; text: {pt:string;en:string}; status: "implemented" | "proposed" };\n'
    (ROOT/'src/data/diagrams.ts').write_text(header+'export const diagrams: Diagram[] = '+json.dumps(exports,ensure_ascii=False,indent=2)+';\n',encoding='utf8')
    print(f'Generated {len(exports)*2} SVGs and typed diagram data.')

if __name__=='__main__':
    main()
