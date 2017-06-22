Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/xenial64"

  config.vm.network "private_network", ip: "192.168.10.10"

  config.vm.provider "virtualbox" do |virtualbox|
    virtualbox.memory = "1024"
  end

  config.vm.provision "shell" do |shell|
    shell.inline = "apt-get --yes install python-minimal"
  end

  config.vm.provision "ansible_local" do |ansible|
    ansible.playbook = "infrastructure/ansible/genesis.yml"
  end
end
