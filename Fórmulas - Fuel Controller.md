##### Antigravity - Fuel Controller





1. Lista do Histórico do mais recente não parte superior par ao mais antigo na parte inferior em caixa de correr
2. adicionar algum efeito skeuomorfico para hodômetro com imitação retro  e "vidro" sobre o hodômetro.
3. opção para escolher o carro a ser usado na pagina inicial
4. Abrir uma pasta fora do projeto investimentos, com o nome Fuel\_Controller





###### Fórmulas:



1. o alerta de troca de óleo:    "quilometragem de troca de óleo" - "quilometragem de abastecimento"   < ou = 100
2. *"**Km percorrido**"* = "hodômetro atual " - " hodômetro do ultimo abastecimento"
3. "***km/L atual***"  = "Km percorrido" /  "litros abastecidos"
4. "***Combustível Consumido***":

   * se (IF)            "nível do tanque" = "Tanque cheio"

&#x09;"combustível consumido" =  "Km percorrido"/ "Km/L" Anterior

* se (IF)             "nível do tanque" = "Parcial"

&#x09;"combustível consumido" =  "Km percorrido"/ "Km/L" Médio





###### Nos CARDS:

1. &#x20;"***Tanque (L)***" :

   * se (IF)            "nível do tanque" = "Tanque cheio"

&#x09;"***Tanque (L)***"  = "capacidade tanque (L)"

* se (IF)             "nível do tanque" = "Parcial"

&#x09;"***Tanque (L)***"  = "capacidade tanque (L)"  - "Combustível consumido" + "litros abastecidos"



1. "***Combustível Consumido***":

   * se (IF)            "nível do tanque" = "Tanque cheio"

&#x09;"combustível consumido" = 0

* se (IF)             "nível do tanque" = "Parcial"

&#x09;"combustível consumido" =  "Km percorrido"/ "Km/L" Médio





###### Para carro Elétrico:



mudar as unidades de (L) para (KWh) em:

1. no lugar de "Comb. consumido (L)" para "Energia consumida (KWh)" e
2. no lugar de "km/l" mudar "Km/kWh"
3. no lugar de "Tanque (L)", mudar para "Bateria (KW/h)
4. mudar a formula do tanque para Bateria = \[ ("Capacidade tanque (L)" - "Combustível consumido") / "Capacidade do Tanque (L)" -1 ] x 100







###### *Informações Immportantes -*



&#x20;"*Smart Fuel* é um assistente de gerenciamento de abastecimento de carros, feito em um design Premium, para controle de abastecimento do carro, trocas de óleo e mostra o consumo de combustível do carro em cada abastecimento.

Com simples toques de botões mostra :

* Combustível gasto
* quantidade de litros no tanque
* quilômetros percorrido
* consumo de combustível por quilômetro
* Emite alertas para troca de óleo
* Marca abastecimentos aonde houve consumo excessivo de combustível, seja por falhas mecânica ou postos fraudulentos.
* Histórico de abastecimentos por veículo, ideal para gerenciamento de frota de carros,  de empregados, filhos, etc..."

